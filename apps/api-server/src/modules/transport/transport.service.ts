import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeliveryStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class TransportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async createDelivery(userId: string, dto: CreateDeliveryDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { delivery: true },
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    if (
      order.status !== OrderStatus.CONFIRMED &&
      order.status !== OrderStatus.PREPARING
    ) {
      throw new BadRequestException(
        'Faqat CONFIRMED yoki PREPARING holatdagi buyurtma yetkaziladi',
      );
    }

    if (order.delivery) {
      throw new BadRequestException(
        'Bu buyurtma uchun yetkazish allaqachon yaratilgan',
      );
    }

    const delivery = await this.prisma.$transaction(async (tx) => {
      const newDelivery = await tx.delivery.create({
        data: {
          orderId: order.id,
          transportUserId: userId,
          status: DeliveryStatus.ASSIGNED,
          pickupAddress: dto.pickupAddress,
          deliveryAddress: dto.deliveryAddress,
          note: dto.note,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PREPARING },
      });

      return newDelivery;
    });

    // Blockchain ga yoz
    await this.blockchainService.addBlock(
      'DELIVERY_STARTED',
      delivery.id,
      'Delivery',
      {
        orderId: order.id,
        transportUserId: userId,
        deliveryAddress: dto.deliveryAddress,
        pickupAddress: dto.pickupAddress,
      },
      userId,
      order.sellerId,
    );

    return delivery;
  }

  async updateDeliveryStatus(
    deliveryId: string,
    userId: string,
    dto: UpdateDeliveryDto,
  ) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, transportUserId: userId },
      include: { order: { include: { payment: true } } },
    });

    if (!delivery) throw new NotFoundException('Yetkazish topilmadi');

    const validTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      ASSIGNED: [DeliveryStatus.PICKED_UP, DeliveryStatus.FAILED],
      PICKED_UP: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.FAILED],
      IN_TRANSIT: [DeliveryStatus.ARRIVED, DeliveryStatus.FAILED],
      ARRIVED: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED],
      DELIVERED: [],
      FAILED: [],
    };

    if (!validTransitions[delivery.status].includes(dto.status)) {
      throw new BadRequestException(
        `${delivery.status} dan ${dto.status} ga o'tish mumkin emas`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updateData: any = {
        status: dto.status,
        note: dto.note,
      };

      if (dto.status === DeliveryStatus.PICKED_UP) {
        updateData.pickedUpAt = new Date();
        await tx.order.update({
          where: { id: delivery.orderId },
          data: { status: OrderStatus.SHIPPED },
        });
      }

      if (dto.status === DeliveryStatus.IN_TRANSIT) {
        await tx.order.update({
          where: { id: delivery.orderId },
          data: { status: OrderStatus.SHIPPED },
        });
      }

      if (dto.status === DeliveryStatus.ARRIVED) {
        updateData.arrivedAt = new Date();
      }

      if (dto.status === DeliveryStatus.DELIVERED) {
        updateData.deliveredAt = new Date();

        await tx.order.update({
          where: { id: delivery.orderId },
          data: { status: OrderStatus.DELIVERED },
        });

        if (delivery.order.payment) {
          await tx.payment.update({
            where: { orderId: delivery.orderId },
            data: {
              status: PaymentStatus.RELEASED,
              releasedAt: new Date(),
            },
          });

          await tx.order.update({
            where: { id: delivery.orderId },
            data: { paymentStatus: PaymentStatus.RELEASED },
          });
        }
      }

      if (dto.status === DeliveryStatus.FAILED) {
        updateData.failedAt = new Date();
        updateData.failReason = dto.note;
      }

      return tx.delivery.update({
        where: { id: deliveryId },
        data: updateData,
        include: {
          order: {
            include: {
              payment: true,
              product: true,
              seller: {
                select: { id: true, fullName: true, phone: true },
              },
            },
          },
        },
      });
    });

    // Blockchain ga yoz
    const blockType =
      dto.status === DeliveryStatus.DELIVERED
        ? 'DELIVERY_COMPLETED'
        : dto.status === DeliveryStatus.FAILED
        ? 'DELIVERY_FAILED'
        : `DELIVERY_${dto.status}`;

    await this.blockchainService.addBlock(
      blockType,
      deliveryId,
      'Delivery',
      {
        orderId: delivery.orderId,
        status: dto.status,
        transportUserId: userId,
        note: dto.note,
      },
      userId,
    );

    return updated;
  }

  async getMyDeliveries(userId: string) {
    return this.prisma.delivery.findMany({
      where: { transportUserId: userId },
      include: {
        order: {
          include: {
            product: true,
            seller: {
              select: { id: true, fullName: true, phone: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDeliveryById(deliveryId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: {
          include: {
            product: { include: { farmer: true } },
            seller: {
              select: { id: true, fullName: true, phone: true },
            },
            payment: true,
          },
        },
      },
    });

    if (!delivery) throw new NotFoundException('Yetkazish topilmadi');
    return delivery;
  }

  async getAvailableOrders() {
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.CONFIRMED,
        delivery: null,
      },
      include: {
        product: { include: { farmer: true } },
        seller: {
          select: { id: true, fullName: true, phone: true },
        },
      },
      orderBy: { confirmedAt: 'desc' },
    });
  }
}
