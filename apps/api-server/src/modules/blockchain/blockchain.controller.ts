import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('chain')
  getChain() {
    return this.blockchainService.getChain();
  }

  @Get('verify')
  verifyChain() {
    return this.blockchainService.verifyChain();
  }

  @Get('stats')
  getStats() {
    return this.blockchainService.getStats();
  }

  @Get('entity/:entityId')
  @UseGuards(JwtAuthGuard)
  getByEntity(@Param('entityId') entityId: string) {
    return this.blockchainService.getBlockByEntity(entityId);
  }
}