import { IsString, IsNumber, Min } from 'class-validator';

export class CreateTableDto {
  @IsString()
  number: string;

  @IsNumber()
  @Min(1)
  capacity: number;
}