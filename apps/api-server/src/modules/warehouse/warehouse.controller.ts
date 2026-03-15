import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UserRoleType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { WarehouseService } from './warehouse.service';
import { PackageProductDto } from './dto/package-product.dto';
import { StoreProductDto } from './dto/store-product.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleType.FARMER)
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Patch('package')
  packageProduct(@Req() req: any, @Body() dto: PackageProductDto) {
    return this.warehouseService.packageProduct(req.user.userId, dto);
  }

  @Get('packaged')
  getPackagedProducts(@Req() req: any) {
    return this.warehouseService.getPackagedProducts(req.user.userId);
  }

  @Patch('store')
  storeProduct(@Req() req: any, @Body() dto: StoreProductDto) {
    return this.warehouseService.storeProduct(req.user.userId, dto);
  }

  @Get('stored')
  getStoredProducts(@Req() req: any) {
    return this.warehouseService.getStoredProducts(req.user.userId);
  }
}