import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Prisma, UserRoleType } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
      include: { role: true, farmer: true },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true, farmer: true },
    });
  }

  async findByPassport(passportSeries: string) {
    return this.prisma.user.findUnique({
      where: { passportSeries },
    });
  }

  async findByJshir(jshir: string) {
    return this.prisma.user.findUnique({
      where: { jshir },
    });
  }

  async createUser(data: {
    fullName: string;
    phone: string;
    email?: string;
    passwordHash: string;
    role: UserRoleType;
    passportSeries?: string;
    jshir?: string;
    farmName?: string;
    region?: string;
    district?: string;
    address?: string;
  }) {
    const role = await this.prisma.role.findUnique({
      where: { name: data.role },
    });

    if (!role) {
      throw new Error(`Role topilmadi: ${data.role}`);
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          passwordHash: data.passwordHash,
          roleId: role.id,
          passportSeries: data.passportSeries || null,
          jshir: data.jshir || null,
          verifyStatus: 'PENDING',
        },
        include: { role: true },
      });

      if (data.role === UserRoleType.FARMER) {
        await tx.farmer.create({
          data: {
            userId: user.id,
            farmName: data.farmName || `${data.fullName} fermasi`,
            region: data.region || "Noma'lum",
            district: data.district,
            address: data.address,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: user.id },
        include: { role: true, farmer: true },
      });
    });
  }
}