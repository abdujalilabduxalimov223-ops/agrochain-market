import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto) {
    // Telefon tekshiruv
    const existingPhone = await this.usersService.findByPhone(dto.phone);
    if (existingPhone) {
      throw new BadRequestException(
        "Bu telefon raqam bilan foydalanuvchi allaqachon ro'yxatdan o'tgan",
      );
    }

    // Pasport tekshiruv — 1 pasport = 1 hisob
    const existingPassport = await this.usersService.findByPassport(
      dto.passportSeries.toUpperCase(),
    );
    if (existingPassport) {
      throw new BadRequestException(
        "Bu pasport seriyasi bilan allaqachon ro'yxatdan o'tilgan. " +
          'Har bir pasport orqali faqat 1 ta hisob yaratish mumkin.',
      );
    }

    // JSHIR tekshiruv
    const existingJshir = await this.usersService.findByJshir(dto.jshir);
    if (existingJshir) {
      throw new BadRequestException(
        "Bu JSHIR bilan allaqachon ro'yxatdan o'tilgan.",
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser({
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      passwordHash,
      role: dto.role,
      passportSeries: dto.passportSeries.toUpperCase(),
      jshir: dto.jshir,
      farmName: dto.farmName,
      region: dto.region,
      district: dto.district,
      address: dto.address,
    });

    return {
      message:
        "Ro'yxatdan o'tish muvaffaqiyatli! Hisobingiz admin tomonidan tasdiqlanishini kuting.",
      user: {
        id: user?.id,
        fullName: user?.fullName,
        phone: user?.phone,
        verifyStatus: user?.verifyStatus,
        role: user?.role
          ? { id: user.role.id, name: user.role.name }
          : null,
        farmer: user?.farmer
          ? {
              id: user.farmer.id,
              farmName: user.farmer.farmName,
              region: user.farmer.region,
            }
          : null,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByPhone(dto.phone);

    if (!user) {
      throw new UnauthorizedException("Telefon yoki parol noto'g'ri");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Telefon yoki parol noto'g'ri");
    }

    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role.name,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role.name,
        verifyStatus: user.verifyStatus,
      },
    };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      status: user.status,
      role: user.role.name,
      verifyStatus: user.verifyStatus,
      farmer: user.farmer
        ? {
            id: user.farmer.id,
            farmName: user.farmer.farmName,
            region: user.farmer.region,
            district: user.farmer.district,
            address: user.farmer.address,
            rating: user.farmer.rating,
          }
        : null,
    };
  }
}