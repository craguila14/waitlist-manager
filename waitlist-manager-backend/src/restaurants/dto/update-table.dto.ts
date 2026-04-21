import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { TableStatus } from '../../database/entities/table.entity';

export class UpdateTableDto {
  @IsString()
  @IsOptional()
  number?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus;
}