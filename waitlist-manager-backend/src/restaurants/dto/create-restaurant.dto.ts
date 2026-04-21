import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedWaitMinutes?: number;
}