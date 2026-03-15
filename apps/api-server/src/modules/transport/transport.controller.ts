import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserRoleType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TransportService } from './transport.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleType.TRANSPORT)
@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Get('available-orders')
  getAvailableOrders() {
    return this.transportService.getAvailableOrders();
  }

  @Post('delivery')
  createDelivery(@Req() req: any, @Body() dto: CreateDeliveryDto) {
    return this.transportService.createDelivery(req.user.userId, dto);
  }

  @Get('my-deliveries')
  getMyDeliveries(@Req() req: any) {
    return this.transportService.getMyDeliveries(req.user.userId);
  }

  @Get('delivery/:id')
  getDeliveryById(@Param('id') id: string) {
    return this.transportService.getDeliveryById(id);
  }

  @Patch('delivery/:id/status')
  updateDeliveryStatus(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateDeliveryDto,
  ) {
    return this.transportService.updateDeliveryStatus(id, req.user.userId, dto);
  }
}