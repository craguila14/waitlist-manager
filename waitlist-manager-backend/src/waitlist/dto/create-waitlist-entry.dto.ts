import { IsString, IsNumber, Min, Max, IsUUID, IsOptional } from 'class-validator';

export class CreateWaitlistEntryDto {
  @IsUUID()
  restaurantId: string;

  @IsString()
  guestName: string;

  @IsNumber()
  @Min(1)
  @Max(20)
  partySize: number;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  notes?: string;
}