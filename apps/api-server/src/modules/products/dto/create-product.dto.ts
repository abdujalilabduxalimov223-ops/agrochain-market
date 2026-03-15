import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0.1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  originCountry?: string;

  @IsOptional()
  @IsString()
  originRegion?: string;

  @IsOptional()
  @IsDateString()
  harvestDate?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}