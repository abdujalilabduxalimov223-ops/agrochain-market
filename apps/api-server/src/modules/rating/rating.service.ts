import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}

  // Seller fermerga baho beradi
  async createRating(userId: string, dto: CreateRatingDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: dto.orderId,
        sellerId: userId,
      },
      include: {
        product: {
          include: { farmer: true },
        },
        ratings: true,
      },
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    if (order.status !== 'DELIVERED') {
      throw new BadRequestException(
        'Faqat yetkazilgan buyurtmaga baho beriladi',
      );
    }

    const alreadyRated = order.ratings.find(
      (r) => r.fromUserId === userId,
    );

    if (alreadyRated) {
      throw new BadRequestException('Siz bu buyurtmaga allaqachon baho bergansiz');
    }

    const rating = await this.prisma.$transaction(async (tx) => {
      const newRating = await tx.rating.create({
        data: {
          orderId: order.id,
          fromUserId: userId,
          toFarmerId: order.product.farmerId,
          score: dto.score,
          comment: dto.comment,
        },
      });

      // Fermer reytingini qayta hisoblash
      const allRatings = await tx.rating.findMany({
        where: { toFarmerId: order.product.farmerId },
      });

      const totalScore = allRatings.reduce((sum, r) => sum + r.score, 0);
      const avgRating = totalScore / allRatings.length;

      await tx.farmer.update({
        where: { id: order.product.farmerId },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          ratingCount: allRatings.length,
        },
      });

      return newRating;
    });

    return {
      message: 'Baho muvaffaqiyatli berildi',
      rating,
    };
  }

  // Fermer reytingini ko'rish
  async getFarmerRating(farmerId: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { id: farmerId },
      select: {
        id: true,
        farmName: true,
        region: true,
        rating: true,
        ratingCount: true,
      },
    });

    if (!farmer) throw new NotFoundException('Fermer topilmadi');

    const ratings = await this.prisma.rating.findMany({
      where: { toFarmerId: farmerId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      farmer,
      ratings,
    };
  }

  // Buyurtma reytingini ko'rish
  async getOrderRatings(orderId: string) {
    return this.prisma.rating.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }
}