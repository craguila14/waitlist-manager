import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WaitlistEntry, WaitlistEntryStatus } from '../database/entities/waitlist-entry.entity';
import { Restaurant } from '../database/entities/restaurant.entity';
import { User } from '../database/entities/user.entity';
import { CreateWaitlistEntryDto } from './dto/create-waitlist-entry.dto';
import { WaitlistGateway } from './waitlist.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(WaitlistEntry)
    private readonly waitlistRepo: Repository<WaitlistEntry>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    private readonly waitlistGateway: WaitlistGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ─── Unirse a la fila (ruta pública) ────────────────────────────────────────

  async join(dto: CreateWaitlistEntryDto): Promise<WaitlistEntry> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id: dto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    if (!restaurant.isOpen) {
      throw new BadRequestException('El restaurante está cerrado');
    }

    const { maxPosition } = await this.waitlistRepo
      .createQueryBuilder('entry')
      .select('MAX(entry.position)', 'maxPosition')
      .where('entry.restaurantId = :restaurantId', { restaurantId: dto.restaurantId })
      .andWhere('entry.status = :status', { status: WaitlistEntryStatus.WAITING })
      .getRawOne();

    const position = (maxPosition ?? 0) + 1;

    const entry = this.waitlistRepo.create({
      guestName: dto.guestName,
      partySize: dto.partySize,
      phone: dto.phone,
      notes: dto.notes ?? null,
      position,
      restaurant,
    });

    const saved = await this.waitlistRepo.save(entry);

    await this.waitlistGateway.emitWaitlistUpdate(dto.restaurantId);

    return saved;
  }

  // ─── Ver la fila completa (para el dashboard) ────────────────────────────────

  async getWaitlist(restaurantId: string, currentUser: User): Promise<WaitlistEntry[]> {
    this.verifyAccess(currentUser, restaurantId);

    return this.waitlistRepo.find({
      where: {
        restaurant: { id: restaurantId },
        status: WaitlistEntryStatus.WAITING,
      },
      order: { position: 'ASC' },
    });
  }

  // ─── Llamar a una party ──────────────────────────────────────────────────────

  async callEntry(entryId: string, currentUser: User): Promise<WaitlistEntry> {
    const entry = await this.findEntryOrFail(entryId);

    this.verifyAccess(currentUser, entry.restaurant.id);

    if (entry.status !== WaitlistEntryStatus.WAITING) {
      throw new BadRequestException('Esta entrada no está en estado de espera');
    }

    entry.status = WaitlistEntryStatus.CALLED;
    entry.calledAt = new Date();
    const saved = await this.waitlistRepo.save(entry);

    // Enviamos el SMS — en desarrollo aparece en consola (modo mock).
    const message = this.notificationsService.getCalledMessage(
      entry.guestName,
      entry.restaurant.name,
    );
    await this.notificationsService.sendSms(entry.phone, message);

    await this.waitlistGateway.emitWaitlistUpdate(entry.restaurant.id);
    await this.waitlistGateway.emitEntryUpdated(entry.restaurant.id, saved);

    return saved;
  }

  // ─── Sentar a una party ──────────────────────────────────────────────────────

  async seatEntry(entryId: string, currentUser: User): Promise<WaitlistEntry> {
  const entry = await this.findEntryOrFail(entryId);

  this.verifyAccess(currentUser, entry.restaurant.id);

  if (entry.status !== WaitlistEntryStatus.CALLED) {
    throw new BadRequestException('Solo se puede sentar una party que fue llamada');
  }

  const currentPosition = entry.position;

  entry.status = WaitlistEntryStatus.SEATED;
  entry.seatedAt = new Date();
  entry.position = 0;
  const saved = await this.waitlistRepo.save(entry);

  await this.reorderAfter(entry.restaurant.id, currentPosition);
  await this.waitlistGateway.emitWaitlistUpdate(entry.restaurant.id);

  return saved;
}

  // ─── Cancelar una entrada ────────────────────────────────────────────────────

  async cancelEntry(entryId: string, currentUser?: User): Promise<WaitlistEntry> {
    const entry = await this.findEntryOrFail(entryId);

    if (currentUser) {
      this.verifyAccess(currentUser, entry.restaurant.id);
    }

    if (entry.status === WaitlistEntryStatus.SEATED) {
      throw new BadRequestException('No se puede cancelar una entrada ya sentada');
    }

    const previousStatus = entry.status;
    const previousPosition = entry.position;

    entry.status = WaitlistEntryStatus.CANCELLED;
    const saved = await this.waitlistRepo.save(entry);

    if (previousStatus === WaitlistEntryStatus.WAITING) {
      await this.reorderAfter(entry.restaurant.id, previousPosition);
    }

    await this.waitlistGateway.emitWaitlistUpdate(entry.restaurant.id);

    return saved;
  }

  async finishEntry(entryId: string, currentUser: User): Promise<WaitlistEntry> {
  const entry = await this.findEntryOrFail(entryId);

  this.verifyAccess(currentUser, entry.restaurant.id);

  if (entry.status !== WaitlistEntryStatus.SEATED) {
    throw new BadRequestException('Solo se puede finalizar una party sentada');
  }

  entry.status = WaitlistEntryStatus.FINISHED;
  const saved = await this.waitlistRepo.save(entry);

  await this.waitlistGateway.emitWaitlistUpdate(entry.restaurant.id);

  return saved;
}

  // ─── Helpers privados ────────────────────────────────────────────────────────

  private async reorderAfter(restaurantId: string, position: number): Promise<void> {
    await this.waitlistRepo
      .createQueryBuilder()
      .update(WaitlistEntry)
      .set({ position: () => 'position - 1' })
      .where('"restaurantId" = :restaurantId', { restaurantId })
      .andWhere('position > :position', { position })
      .andWhere('status = :status', { status: WaitlistEntryStatus.WAITING })
      .execute();
  }

  private async findEntryOrFail(entryId: string): Promise<WaitlistEntry> {
    const entry = await this.waitlistRepo.findOne({
      where: { id: entryId },
      relations: ['restaurant'],
    });

    if (!entry) {
      throw new NotFoundException('Entrada no encontrada');
    }

    return entry;
  }

  private verifyAccess(user: User, restaurantId: string): void {
    if (user.restaurant?.id !== restaurantId) {
      throw new ForbiddenException('No tienes acceso a este restaurante');
    }
  }
}