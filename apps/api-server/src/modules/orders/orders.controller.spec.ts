import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Seller endpoints
  @Post()
  createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.userId, dto);
  }

  @Get('my')
  getMyOrders(@Req() req: any) {
    return this.ordersService.getMyOrders(req.user.userId);
  }

  @Patch('my/:id/cancel')
  cancelMyOrder(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.cancelMyOrder(id, req.user.userId);
  }

  // Fermer endpoints
  @Get('farmer/incoming')
  getFarmerIncomingOrders(@Req() req: any) {
    return this.ordersService.getFarmerIncomingOrders(req.user.userId);
  }

  @Patch('farmer/:id/confirm')
  confirmOrder(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.confirmOrder(id, req.user.userId);
  }

  @Patch('farmer/:id/cancel')
  cancelOrder(
    @Param('id') id: string,
    @Req() req: any,
    @Query('reason') reason?: string,
  ) {
    return this.ordersService.cancelOrder(id, req.user.userId, reason);
  }

  // Umumiy
  @Get(':id')
  getOrderById(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.getOrderById(id, req.user.userId);
  }
}