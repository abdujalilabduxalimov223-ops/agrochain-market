import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { TransportModule } from './modules/transport/transport.module';
import { RatingModule } from './modules/rating/rating.module';
import { ScanModule } from './modules/scan/scan.module';
import { AdminModule } from './modules/admin/admin.module';
import { UploadModule } from './modules/upload/upload.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
@Module({
  imports: [PrismaModule, UsersModule, AuthModule, ProductsModule, WarehouseModule, CatalogModule, OrdersModule, TransportModule, RatingModule, ScanModule, AdminModule, UploadModule, BlockchainModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}