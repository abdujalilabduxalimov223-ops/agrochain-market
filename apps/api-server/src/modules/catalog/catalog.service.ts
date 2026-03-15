import { Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailableProducts(query?: {
    search?: string;
    category?: string;
    region?: string;
  }) {
    return this.prisma.product.findMany({
      where: {
        status: ProductStatus.STORED,
        ...(query?.search
          ? {
              OR: [
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(query?.category
          ? {
              category: { contains: query.category, mode: 'insensitive' },
            }
          : {}),
        ...(query?.region
          ? {
              originRegion: { contains: query.region, mode: 'insensitive' },
            }
          : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        farmer: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async getAvailableProductById(id: string) {
    return this.prisma.product.findFirst({
      where: {
        id,
        status: ProductStatus.STORED,
      },
      include: {
        farmer: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}