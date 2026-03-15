import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // Umumiy statistika
  async getStats() {
    const [
      totalUsers,
      totalFarmers,
      totalProducts,
      totalOrders,
      totalDeliveries,
      totalRatings,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.farmer.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.delivery.count(),
      this.prisma.rating.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.count({ where: { status: 'CANCELLED' } }),
    ]);

    const totalRevenue = await this.prisma.payment.aggregate({
      where: { status: 'RELEASED' },
      _sum: { amount: true },
    });

    const lockedAmount = await this.prisma.payment.aggregate({
      where: { status: 'LOCKED' },
      _sum: { amount: true },
    });

    return {
      foydalanuvchilar: {
        jami: totalUsers,
        fermerlar: totalFarmers,
      },
      mahsulotlar: {
        jami: totalProducts,
      },
      buyurtmalar: {
        jami: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      yetkazishlar: {
        jami: totalDeliveries,
      },
      reytinglar: {
        jami: totalRatings,
      },
      tolovlar: {
        jami_tushumdagi: totalRevenue._sum.amount || 0,
        muzlatilgan: lockedAmount._sum.amount || 0,
      },
    };
  }

  // Barcha foydalanuvchilar
  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          role: true,
          farmer: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        phone: u.phone,
        email: u.email,
        status: u.status,
        role: u.role.name,
        farmer: u.farmer
          ? {
              farmName: u.farmer.farmName,
              region: u.farmer.region,
              rating: u.farmer.rating,
            }
          : null,
        createdAt: u.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Foydalanuvchi statusini o'zgartirish
  async updateUserStatus(userId: string, status: UserStatus) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        fullName: true,
        phone: true,
        status: true,
      },
    });
  }

  // Barcha orderlar
  async getAllOrders(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        include: {
          product: {
            select: {
              name: true,
              category: true,
              farmer: {
                select: { farmName: true, region: true },
              },
            },
          },
          seller: {
            select: { fullName: true, phone: true },
          },
          delivery: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count(),
    ]);

    return {
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Barcha mahsulotlar
  async getAllProducts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        include: {
          farmer: {
            select: { farmName: true, region: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count(),
    ]);

    return {
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Barcha fermerlar va reytinglari
  async getAllFarmers() {
    return this.prisma.farmer.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            phone: true,
            email: true,
            status: true,
          },
        },
        products: {
          select: { id: true, status: true },
        },
      },
      orderBy: { rating: 'desc' },
    });
  }

  // Scan tarixi statistikasi
  async getScanStats() {
    const totalScans = await this.prisma.scanHistory.count();

    const recentScans = await this.prisma.scanHistory.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { name: true, batchNumber: true, qrCode: true },
        },
      },
    });

    return {
      totalScans,
      recentScans,
    };
  }
}