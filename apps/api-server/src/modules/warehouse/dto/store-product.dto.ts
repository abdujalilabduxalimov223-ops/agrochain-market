import { IsNotEmpty, IsString } from 'class-validator';

export class StoreProductDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  warehouseName: string;

  @IsString()
  @IsNotEmpty()
  warehouseLocation: string;

  @IsString()
  @IsNotEmpty()
  shelfCode: string;
}