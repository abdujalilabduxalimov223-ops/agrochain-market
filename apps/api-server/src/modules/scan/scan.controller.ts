import { Controller, Get, Headers, Ip, Param } from '@nestjs/common';
import { ScanService } from './scan.service';

@Controller('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  // QR kod orqali skanerlash
  @Get('qr/:qrCode')
  scanByQrCode(
    @Param('qrCode') qrCode: string,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.scanService.scanByQrCode(qrCode, ip, userAgent);
  }

  // Batch number orqali skanerlash
  @Get('batch/:batchNumber')
  scanByBatchNumber(
    @Param('batchNumber') batchNumber: string,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.scanService.scanByBatchNumber(batchNumber, ip, userAgent);
  }

  // Skan tarixi
  @Get('history/:productId')
  getScanHistory(@Param('productId') productId: string) {
    return this.scanService.getScanHistory(productId);
  }
}