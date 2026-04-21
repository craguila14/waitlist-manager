import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { CreateWaitlistEntryDto } from './dto/create-waitlist-entry.dto';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  join(@Body() dto: CreateWaitlistEntryDto) {
    return this.waitlistService.join(dto);
  }

  // Rutas protegidas — solo staff autenticado
  @Get(':restaurantId')
  @UseGuards(JwtGuard)
  getWaitlist(
    @Param('restaurantId') restaurantId: string,
    @CurrentUser() user: User,
  ) {
    return this.waitlistService.getWaitlist(restaurantId, user);
  }

  @Patch(':id/call')
  @UseGuards(JwtGuard)
  call(@Param('id') id: string, @CurrentUser() user: User) {
    return this.waitlistService.callEntry(id, user);
  }

  @Patch(':id/seat')
  @UseGuards(JwtGuard)
  seat(@Param('id') id: string, @CurrentUser() user: User) {
    return this.waitlistService.seatEntry(id, user);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @CurrentUser() user?: User,
  ) {
    return this.waitlistService.cancelEntry(id, user);
  }
}