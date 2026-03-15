import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { PackageProductDto } from './dto/package-product.dto';
import { StoreProductDto } from './dto/store-product.dto';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  async packageProduct(userId: string, dto: PackageProductDto) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new BadRequestException("Faqat fermer o'z mahsulotini qadoqlashi mumkin");
    }

    const product = await this.prisma.product.findFirst({
      where: {
        id: dto.productId,
        farmerId: farmer.id,
      },
    });

    if (!product) {
      throw new NotFoundException('Mahsulot topilmadi');
    }

    if (product.status !== ProductStatus.DRAFT) {
      throw new BadRequestException('Faqat DRAFT holatdagi mahsulot qadoqlanadi');
    }

    return this.prisma.product.update({
      where: { id: product.id },
      data: {
        status: ProductStatus.PACKAGED,
        packagedAt: new Date(),
      },
    });
  }

  async getPackagedProducts(userId: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new BadRequestException("Faqat fermer o'z mahsulotlarini ko'ra oladi");
    }

    return this.prisma.product.findMany({
      where: {
        farmerId: farmer.id,
        status: ProductStatus.PACKAGED,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async storeProduct(userId: string, dto: StoreProductDto) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new BadRequestException("Faqat fermer o'z mahsulotini omborga joylashi mumkin");
    }

    const product = await this.prisma.product.findFirst({
      where: {
        id: dto.productId,
        farmerId: farmer.id,
      },
    });

    if (!product) {
      throw new NotFoundException('Mahsulot topilmadi');
    }

    if (product.status !== ProductStatus.PACKAGED) {
      throw new BadRequestException('Faqat PACKAGED holatdagi mahsulot omborga joylanadi');
    }

    return this.prisma.product.update({
      where: { id: product.id },
      data: {
        status: ProductStatus.STORED,
        storedAt: new Date(),
        warehouseName: dto.warehouseName,
        warehouseLocation: dto.warehouseLocation,
        shelfCode: dto.shelfCode,
      },
    });
  }

  async getStoredProducts(userId: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new BadRequestException("Faqat fermer o'z mahsulotlarini ko'ra oladi");
    }

    return this.prisma.product.findMany({
      where: {
        farmerId: farmer.id,
        status: ProductStatus.STORED,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }
}