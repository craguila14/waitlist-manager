import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { NotificationsModule } from './notifications/notifications.module';
import { User } from './database/entities/user.entity';
import { Restaurant } from './database/entities/restaurant.entity';
import { Table } from './database/entities/table.entity';
import { WaitlistEntry } from './database/entities/waitlist-entry.entity';
import { WaitlistModule } from './waitlist/waitlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [User, Restaurant, Table, WaitlistEntry],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    AuthModule,
    RestaurantsModule,
    WaitlistModule,
    NotificationsModule,
  ],
})
export class AppModule {}