import {
  Body, Controller, Get, Param,
  Patch, Post, Req, UseGuards
} from '@nestjs/common';
import { UserRoleType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleType.FARMER)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  createProduct(@Req() req: any, @Body() dto: CreateProductDto) {
    return this.productsService.createProduct(req.user.userId, dto);
  }

  @Get('my')
  getMyProducts(@Req() req: any) {
    return this.productsService.getMyProducts(req.user.userId);
  }

  @Get(':id')
  getProductById(@Param('id') id: string, @Req() req: any) {
    return this.productsService.getProductById(id, req.user.userId);
  }

  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: any,
  ) {
    return this.productsService.updateProduct(id, req.user.userId, body);
  }
}
