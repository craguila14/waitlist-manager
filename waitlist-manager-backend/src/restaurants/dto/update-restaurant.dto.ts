import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class UpdateRestaurantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  isOpen?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedWaitMinutes?: number;
}