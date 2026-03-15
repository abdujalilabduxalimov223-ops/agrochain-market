import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadProductImage(
    productId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new NotFoundException('Fermer topilmadi');
    }

    const product = await this.prisma.product.findFirst({
      where: { id: productId, farmerId: farmer.id },
    });

    if (!product) {
      throw new NotFoundException('Mahsulot topilmadi');
    }

    if (product.imageUrl) {
      const oldPath = path.join(process.cwd(), 'uploads', path.basename(product.imageUrl));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const imageUrl = `/uploads/${file.filename}`;

    return this.prisma.product.update({
      where: { id: productId },
      data: { imageUrl },
    });
  }

  async deleteProductImage(productId: string, userId: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) throw new NotFoundException('Fermer topilmadi');

    const product = await this.prisma.product.findFirst({
      where: { id: productId, farmerId: farmer.id },
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    if (product.imageUrl) {
      const filePath = path.join(process.cwd(), 'uploads', path.basename(product.imageUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { imageUrl: null },
    });
  }
}