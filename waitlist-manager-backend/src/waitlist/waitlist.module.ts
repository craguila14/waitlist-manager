import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaitlistEntry } from '../database/entities/waitlist-entry.entity';
import { Restaurant } from '../database/entities/restaurant.entity';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { WaitlistGateway } from './waitlist.gateway';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([WaitlistEntry, Restaurant]), NotificationsModule],
  controllers: [WaitlistController],
  providers: [WaitlistService, WaitlistGateway],
  exports: [WaitlistService],
})
export class WaitlistModule {}