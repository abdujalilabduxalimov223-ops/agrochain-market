import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserRoleType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(UserRoleType.SELLER)
  @Post()
  createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.userId, dto);
  }

  @Roles(UserRoleType.SELLER)
  @Get('my')
  getMyOrders(@Req() req: any) {
    return this.ordersService.getMyOrders(req.user.userId);
  }

  @Roles(UserRoleType.SELLER)
  @Patch('my/:id/cancel')
  cancelMyOrder(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.cancelMyOrder(id, req.user.userId);
  }

  @Roles(UserRoleType.FARMER)
  @Get('farmer/incoming')
  getFarmerIncomingOrders(@Req() req: any) {
    return this.ordersService.getFarmerIncomingOrders(req.user.userId);
  }

  @Roles(UserRoleType.FARMER)
  @Patch('farmer/:id/confirm')
  confirmOrder(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.confirmOrder(id, req.user.userId);
  }

  @Roles(UserRoleType.FARMER)
  @Patch('farmer/:id/cancel')
  cancelOrder(
    @Param('id') id: string,
    @Req() req: any,
    @Query('reason') reason?: string,
  ) {
    return this.ordersService.cancelOrder(id, req.user.userId, reason);
  }

  @Roles(UserRoleType.SELLER, UserRoleType.FARMER)
  @Get(':id')
  getOrderById(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.getOrderById(id, req.user.userId);
  }
}