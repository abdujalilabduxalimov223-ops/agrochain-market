import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class ScanService {
  constructor(private readonly prisma: PrismaService) {}

  async scanByQrCode(qrCode: string, ip?: string, userAgent?: string) {
    const product = await this.prisma.product.findUnique({
      where: { qrCode },
      include: {
        farmer: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            delivery: true,
            payment: true,
            ratings: true,
            seller: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    // Skan tarixini saqlash
    await this.prisma.scanHistory.create({
      data: {
        productId: product.id,
        scannedByIp: ip,
        userAgent: userAgent,
      },
    });

    const lastOrder = product.orders[0];

    return {
      product: {
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        quantity: product.quantity,
        unit: product.unit,
        price: product.price,
        status: product.status,
        batchNumber: product.batchNumber,
        qrCode: product.qrCode,
        originCountry: product.originCountry,
        originRegion: product.originRegion,
        imageUrl: product.imageUrl,
        expiresAt: product.expiresAt,
      },
      timeline: {
        yaratildi: product.createdAt,
        qadoqlandi: product.packagedAt,
        omborga_joylandi: product.storedAt,
        ombor: product.warehouseName
          ? {
              name: product.warehouseName,
              location: product.warehouseLocation,
              shelfCode: product.shelfCode,
            }
          : null,
      },
      fermer: {
        farmName: product.farmer.farmName,
        region: product.farmer.region,
        district: product.farmer.district,
        address: product.farmer.address,
        rating: product.farmer.rating,
        ratingCount: product.farmer.ratingCount,
        contact: product.farmer.user.fullName,
      },
      yetkazish:
        lastOrder?.delivery
          ? {
              status: lastOrder.delivery.status,
              pickupAddress: lastOrder.delivery.pickupAddress,
              deliveryAddress: lastOrder.delivery.deliveryAddress,
              pickedUpAt: lastOrder.delivery.pickedUpAt,
              arrivedAt: lastOrder.delivery.arrivedAt,
              deliveredAt: lastOrder.delivery.deliveredAt,
            }
          : null,
      reyting:
        lastOrder?.ratings?.length > 0
          ? {
              score: lastOrder.ratings[0].score,
              comment: lastOrder.ratings[0].comment,
            }
          : null,
      originallik: {
        tasdiqlangan: true,
        batchNumber: product.batchNumber,
        qrCode: product.qrCode,
      },
    };
  }

  async scanByBatchNumber(batchNumber: string, ip?: string, userAgent?: string) {
    const product = await this.prisma.product.findUnique({
      where: { batchNumber },
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    return this.scanByQrCode(product.qrCode!, ip, userAgent);
  }

  async getScanHistory(productId: string) {
    return this.prisma.scanHistory.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }
}