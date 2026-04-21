import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../database/entities/restaurant.entity';
import { Table, TableStatus } from '../database/entities/table.entity';
import { User } from '../database/entities/user.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(Table)
    private readonly tableRepo: Repository<Table>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ─── Restaurante ────────────────────────────────────────────────────────────

  async create(dto: CreateRestaurantDto, owner: User): Promise<Restaurant> {
    if (owner.restaurant) {
      throw new ConflictException('Ya tienes un restaurante registrado');
    }

    const restaurant = this.restaurantRepo.create({
      name: dto.name,
      phone: dto.phone,
      estimatedWaitMinutes: dto.estimatedWaitMinutes ?? 0,
    });
    const saved = await this.restaurantRepo.save(restaurant);

    await this.userRepo.update(owner.id, { restaurant: saved });

    return saved;
  }

  async findBySlug(slug: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { slug },
      relations: ['tables'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    return restaurant;
  }

  async findById(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id },
      relations: ['tables', 'staff'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    return restaurant;
  }

  async update(
    id: string,
    dto: UpdateRestaurantDto,
    currentUser: User,
  ): Promise<Restaurant> {
    const restaurant = await this.findById(id);

    if (currentUser.restaurant?.id !== restaurant.id) {
      throw new ForbiddenException('No tienes acceso a este restaurante');
    }

    Object.assign(restaurant, dto);
    return this.restaurantRepo.save(restaurant);
  }

  // ─── Mesas ───────────────────────────────────────────────────────────────────

  async createTable(
    restaurantId: string,
    dto: CreateTableDto,
    currentUser: User,
  ): Promise<Table> {
    const restaurant = await this.findById(restaurantId);

    if (currentUser.restaurant?.id !== restaurant.id) {
      throw new ForbiddenException('No tienes acceso a este restaurante');
    }

    const table = this.tableRepo.create({
      number: dto.number,
      capacity: dto.capacity,
      restaurant,
    });

    return this.tableRepo.save(table);
  }

  async updateTable(
    tableId: string,
    dto: UpdateTableDto,
    currentUser: User,
  ): Promise<Table> {
    const table = await this.tableRepo.findOne({
      where: { id: tableId },
      relations: ['restaurant'],
    });

    if (!table) {
      throw new NotFoundException('Mesa no encontrada');
    }

    if (currentUser.restaurant?.id !== table.restaurant.id) {
      throw new ForbiddenException('No tienes acceso a esta mesa');
    }

    Object.assign(table, dto);
    return this.tableRepo.save(table);
  }

  async removeTable(tableId: string, currentUser: User): Promise<void> {
    const table = await this.tableRepo.findOne({
      where: { id: tableId },
      relations: ['restaurant'],
    });

    if (!table) {
      throw new NotFoundException('Mesa no encontrada');
    }

    if (currentUser.restaurant?.id !== table.restaurant.id) {
      throw new ForbiddenException('No tienes acceso a esta mesa');
    }

    await this.tableRepo.remove(table);
  }

  // ─── Staff ───────────────────────────────────────────────────────────────────

  async addStaff(restaurantId: string, staffEmail: string, currentUser: User) {
    const restaurant = await this.findById(restaurantId);

    if (currentUser.restaurant?.id !== restaurant.id) {
      throw new ForbiddenException('No tienes acceso a este restaurante');
    }

    const staffUser = await this.userRepo.findOne({
      where: { email: staffEmail },
    });

    if (!staffUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.userRepo.update(staffUser.id, { restaurant });

    return { message: `${staffUser.name} agregado al equipo` };
  }
}