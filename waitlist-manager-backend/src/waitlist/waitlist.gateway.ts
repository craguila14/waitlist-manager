import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WaitlistEntry, WaitlistEntryStatus } from '../database/entities/waitlist-entry.entity';


@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class WaitlistGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(WaitlistEntry)
    private readonly waitlistRepo: Repository<WaitlistEntry>,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() restaurantId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`restaurant:${restaurantId}`);
    console.log(`Cliente ${client.id} se unió al room restaurant:${restaurantId}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() restaurantId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`restaurant:${restaurantId}`);
  }

  async emitWaitlistUpdate(restaurantId: string): Promise<void> {
    const waitlist = await this.waitlistRepo.find({
      where: {
        restaurant: { id: restaurantId },
        status: WaitlistEntryStatus.WAITING,
      },
      order: { position: 'ASC' },
    });

    this.server.to(`restaurant:${restaurantId}`).emit('waitlistUpdated', waitlist);
  }

  async emitEntryUpdated(restaurantId: string, entry: WaitlistEntry): Promise<void> {
    this.server.to(`restaurant:${restaurantId}`).emit('entryUpdated', entry);
  }
}