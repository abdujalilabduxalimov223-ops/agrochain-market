import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsOptional()
  @IsString()
  pickupAddress?: string;

  @IsOptional()
  @IsString()
  note?: string;
}