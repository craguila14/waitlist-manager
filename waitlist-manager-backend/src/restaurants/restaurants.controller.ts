import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, User } from '../database/entities/user.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { Roles } from '../auth/decorators/roles.decorator';

// ─── Rutas públicas (sin autenticación) ─────────────────────────────────────

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.restaurantsService.findBySlug(slug);
  }

  // ─── Rutas protegidas ──────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  create(
    @Body() dto: CreateRestaurantDto,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.create(dto, user);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  findById(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.update(id, dto, user);
  }

  // ─── Mesas ────────────────────────────────────────────────────────────────

  @Post(':id/tables')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  createTable(
    @Param('id') restaurantId: string,
    @Body() dto: CreateTableDto,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.createTable(restaurantId, dto, user);
  }

  @Patch('tables/:tableId')
  @UseGuards(JwtGuard)
  updateTable(
    @Param('tableId') tableId: string,
    @Body() dto: UpdateTableDto,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.updateTable(tableId, dto, user);
  }

  @Delete('tables/:tableId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  removeTable(
    @Param('tableId') tableId: string,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.removeTable(tableId, user);
  }

  // ─── Staff ────────────────────────────────────────────────────────────────

  @Post(':id/staff')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  addStaff(
    @Param('id') restaurantId: string,
    @Body('email') email: string,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.addStaff(restaurantId, email, user);
  }
}