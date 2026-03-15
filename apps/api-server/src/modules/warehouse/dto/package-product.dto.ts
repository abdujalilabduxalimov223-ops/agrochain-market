import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PackageProductDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}