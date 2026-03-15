import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(userId: string, dto: CreateProductDto) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new BadRequestException('Faqat fermer mahsulot qosha oladi');
    }

    const batchNumber = `BATCH-${Date.now()}`;
    const qrCode = `QR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return this.prisma.product.create({
      data: {
        farmerId: farmer.id,
        name: dto.name,
        category: dto.category,
        description: dto.description,
        quantity: dto.quantity,
        unit: dto.unit,
        price: dto.price,
        originCountry: dto.originCountry || 'Uzbekistan',
        originRegion: dto.originRegion,
        harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        batchNumber,
        qrCode,
      },
    });
  }

  async getMyProducts(userId: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new BadRequestException('Faqat fermer mahsulotlarini kora oladi');
    }

    return this.prisma.product.findMany({
      where: { farmerId: farmer.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(id: string, userId: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new BadRequestException('Faqat fermer mahsulotni kora oladi');
    }

    return this.prisma.product.findFirst({
      where: { id, farmerId: farmer.id },
    });
  }

  async updateProduct(id: string, userId: string, data: any) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new BadRequestException('Fermer topilmadi');
    }

    const product = await this.prisma.product.findFirst({
      where: { id, farmerId: farmer.id },
    });

    if (!product) {
      throw new NotFoundException('Mahsulot topilmadi');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        quantity: data.quantity ? Number(data.quantity) : undefined,
        unit: data.unit,
        price: data.price ? Number(data.price) : undefined,
        originRegion: data.originRegion,
        harvestDate: data.harvestDate ? new Date(data.harvestDate) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  }
}