import { IsOptional, IsString } from 'class-validator';

export class UploadImageDto {
  @IsOptional()
  @IsString()
  productId?: string;
}