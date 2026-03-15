import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, UserRoleType } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
  ) {}

  private generateOrderNumber(): string {
    const date = new Date();
    const ymd =
      date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return `ORD-${ymd}-${rand}`;
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    if (user.role.name !== UserRoleType.SELLER) {
      throw new BadRequestException('Faqat seller buyurtma bera oladi');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { farmer: true },
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    if (product.status !== 'STORED') {
      throw new BadRequestException(
        'Faqat omborga joylangan mahsulot buyurtma qilinadi',
      );
    }

    if (dto.quantity > product.quantity) {
      throw new BadRequestException(
        `Mavjud miqdor: ${product.quantity} ${product.unit}`,
      );
    }

    const unitPrice = Number(product.price);
    const totalPrice = unitPrice * dto.quantity;
    const orderNumber = this.generateOrderNumber();

    const order = await this.prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          orderNumber,
          sellerId: userId,
          productId: product.id,
          quantity: dto.quantity,
          unitPrice,
          totalPrice,
          note: dto.note,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.UNPAID,
        },
        include: {
          product: { include: { farmer: true } },
          seller: {
            select: { id: true, fullName: true, phone: true, email: true },
          },
        },
      });
    });

    // Blockchain ga yoz
    await this.blockchainService.addBlock(
      'ORDER_CREATED',
      order.id,
      'Order',
      {
        orderNumber: order.orderNumber,
        productName: product.name,
        quantity: dto.quantity,
        totalPrice,
        sellerId: userId,
        farmerId: product.farmer?.id,
      },
      userId,
      product.farmer?.userId,
    );

    return order;
  }

  async getMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { sellerId: userId },
      include: {
        product: { include: { farmer: true } },
        delivery: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, sellerId: userId },
      include: {
        product: { include: { farmer: true } },
        delivery: true,
        payment: true,
        ratings: true,
        seller: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
      },
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi');
    return order;
  }

  async getFarmerIncomingOrders(userId: string) {
    const farmer = await this.prisma.farmer.findUnique({ where: { userId } });
    if (!farmer) throw new BadRequestException('Fermer profili topilmadi');

    return this.prisma.order.findMany({
      where: { product: { farmerId: farmer.id } },
      include: {
        product: true,
        seller: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        delivery: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async confirmOrder(orderId: string, userId: string) {
    const farmer = await this.prisma.farmer.findUnique({ where: { userId } });
    if (!farmer) throw new BadRequestException('Fermer profili topilmadi');

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, product: { farmerId: farmer.id } },
      include: { product: true },
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Faqat PENDING holatdagi buyurtma tasdiqlanadi');
    }

    if (order.quantity > order.product.quantity) {
      throw new BadRequestException('Ombordagi miqdor yetarli emas');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const remainingQty = order.product.quantity - order.quantity;

      await tx.product.update({
        where: { id: order.productId },
        data: {
          quantity: remainingQty,
          status: remainingQty <= 0 ? 'ORDERED' : 'STORED',
        },
      });

      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalPrice,
          status: PaymentStatus.LOCKED,
          lockedAt: new Date(),
        },
      });

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.LOCKED,
          confirmedAt: new Date(),
        },
        include: {
          product: true,
          seller: { select: { id: true, fullName: true, phone: true } },
          payment: true,
        },
      });
    });

    // Blockchain ga yoz
    await this.blockchainService.addBlock(
      'ORDER_CONFIRMED',
      order.id,
      'Order',
      {
        orderNumber: order.orderNumber,
        confirmedBy: userId,
        farmerId: farmer.id,
        paymentLocked: true,
        totalPrice: Number(order.totalPrice),
      },
      userId,
      order.sellerId,
    );

    return updated;
  }

  async cancelOrder(orderId: string, userId: string, reason?: string) {
    const farmer = await this.prisma.farmer.findUnique({ where: { userId } });
    if (!farmer) throw new BadRequestException('Fermer profili topilmadi');

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, product: { farmerId: farmer.id } },
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Faqat PENDING holatdagi buyurtma bekor qilinadi');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason || 'Fermer tomonidan bekor qilindi',
      },
    });

    // Blockchain ga yoz
    await this.blockchainService.addBlock(
      'ORDER_CANCELLED',
      order.id,
      'Order',
      {
        orderNumber: order.orderNumber,
        cancelledBy: userId,
        reason: reason || 'Fermer tomonidan bekor qilindi',
      },
      userId,
    );

    return updated;
  }

  async cancelMyOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, sellerId: userId },
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Faqat PENDING holatdagi buyurtma bekor qilinadi');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: 'Seller tomonidan bekor qilindi',
      },
    });

    // Blockchain ga yoz
    await this.blockchainService.addBlock(
      'ORDER_CANCELLED_BY_SELLER',
      order.id,
      'Order',
      {
        orderNumber: order.orderNumber,
        cancelledBy: userId,
      },
      userId,
    );

    return updated;
  }

  async confirmReceived(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, sellerId: userId },
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Mahsulot hali yetkazilmagan');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { orderId },
        data: { status: PaymentStatus.RELEASED, releasedAt: new Date() },
      });

      return tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: PaymentStatus.RELEASED },
      });
    });

    // Blockchain ga yoz
    await this.blockchainService.addBlock(
      'PAYMENT_RELEASED',
      order.id,
      'Payment',
      {
        orderNumber: order.orderNumber,
        sellerId: userId,
        amount: Number(order.totalPrice),
        releasedAt: new Date().toISOString(),
      },
      userId,
    );

    return updated;
  }
}