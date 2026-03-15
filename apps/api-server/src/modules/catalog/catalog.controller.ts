import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  getAvailableProducts(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('region') region?: string,
  ) {
    return this.catalogService.getAvailableProducts({
      search,
      category,
      region,
    });
  }

  @Get('products/:id')
  getAvailableProductById(@Param('id') id: string) {
    return this.catalogService.getAvailableProductById(id);
  }
}