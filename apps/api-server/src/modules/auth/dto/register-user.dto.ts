import {
  IsEmail, IsEnum, IsNotEmpty, IsOptional,
  IsString, MinLength, Matches, Length,
} from 'class-validator';
import { UserRoleType } from '@prisma/client';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Ism familiya kiritilishi shart' })
  fullName: string;

  @IsString()
  @Matches(/^\+998[0-9]{9}$/, {
    message: "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak",
  })
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  password: string;

  @IsEnum(UserRoleType, { message: "Rol noto'g'ri" })
  role: UserRoleType;

  @IsString()
  @IsNotEmpty({ message: 'Pasport seriyasi kiritilishi shart' })
  @Matches(/^[A-Z]{2}[0-9]{7}$/, {
    message: "Pasport seriyasi AA1234567 formatida bo'lishi kerak",
  })
  passportSeries: string;

  @IsString()
  @IsNotEmpty({ message: 'JSHIR kiritilishi shart' })
  @Length(14, 14, { message: 'JSHIR 14 ta raqamdan iborat' })
  @Matches(/^[0-9]{14}$/, { message: 'JSHIR faqat raqamlardan iborat' })
  jshir: string;

  @IsOptional()
  @IsString()
  farmName?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  address?: string;
}