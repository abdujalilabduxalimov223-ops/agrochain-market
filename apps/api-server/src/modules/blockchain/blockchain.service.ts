import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class BlockchainService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureGenesisBlock();
  }

  private calculateHash(
    index: number,
    prevHash: string,
    timestamp: string,
    dataStr: string,
    nonce: number,
  ): string {
    const content = `${index}${prevHash}${timestamp}${dataStr}${nonce}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private async ensureGenesisBlock() {
    const count = await this.prisma.block.count();
    if (count === 0) {
      const timestamp = new Date().toISOString();
      const data = {
        message: 'AgroChain Genesis Block',
        createdAt: timestamp,
      };
      const dataStr = JSON.stringify(data);
      const hash = this.calculateHash(0, '0000000000000000', timestamp, dataStr, 0);

      await this.prisma.block.create({
        data: {
          index: 0,
          hash,
          prevHash: '0000000000000000',
          data: dataStr,
          timestamp: new Date(timestamp),
          nonce: 0,
        },
      });
      console.log('Genesis block yaratildi:', hash);
    }
  }

  async addBlock(
    type: string,
    entityId: string,
    entityType: string,
    data: any,
    fromUserId?: string,
    toUserId?: string,
  ) {
    const lastBlock = await this.prisma.block.findFirst({
      orderBy: { index: 'desc' },
    });

    const newIndex = (lastBlock?.index ?? -1) + 1;
    const prevHash = lastBlock?.hash ?? '0000000000000000';
    const timestamp = new Date().toISOString();

    const blockData = {
      type,
      entityId,
      entityType,
      fromUserId,
      toUserId,
      payload: data,
    };

    const dataStr = JSON.stringify(blockData);

    let nonce = 0;
    let hash = '';

    do {
      hash = this.calculateHash(newIndex, prevHash, timestamp, dataStr, nonce);
      nonce++;
    } while (!hash.startsWith('00'));

    const block = await this.prisma.block.create({
      data: {
        index: newIndex,
        hash,
        prevHash,
        data: dataStr,
        timestamp: new Date(timestamp),
        nonce: nonce - 1,
      },
    });

    const txContent = `${block.id}${type}${entityId}${Date.now()}`;
    const txHash = crypto.createHash('sha256').update(txContent).digest('hex');

    const transaction = await this.prisma.blockTransaction.create({
      data: {
        blockId: block.id,
        type,
        entityId,
        entityType,
        fromUserId,
        toUserId,
        data: dataStr,
        hash: txHash,
      },
    });

    return { block, transaction };
  }

  async getChain() {
    return this.prisma.block.findMany({
      orderBy: { index: 'asc' },
      include: { transactions: true },
    });
  }

  async getBlockByEntity(entityId: string) {
    return this.prisma.blockTransaction.findMany({
      where: { entityId },
      include: { block: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async verifyChain(): Promise<boolean> {
    const blocks = await this.prisma.block.findMany({
      orderBy: { index: 'asc' },
    });

    if (blocks.length <= 1) return true;

    for (let i = 1; i < blocks.length; i++) {
      const current = blocks[i];
      const prev = blocks[i - 1];

      if (current.prevHash !== prev.hash) return false;

      const dataStr = typeof current.data === 'string'
        ? current.data
        : JSON.stringify(current.data);

      const recalculated = this.calculateHash(
        current.index,
        current.prevHash,
        current.timestamp.toISOString(),
        dataStr,
        current.nonce,
      );

      if (current.hash !== recalculated) return false;
    }
    return true;
  }

  async getStats() {
    const totalBlocks = await this.prisma.block.count();
    const totalTx = await this.prisma.blockTransaction.count();
    const isValid = await this.verifyChain();

    const txByType = await this.prisma.blockTransaction.groupBy({
      by: ['type'],
      _count: { type: true },
    });

    return {
      totalBlocks,
      totalTransactions: totalTx,
      isValid,
      transactionsByType: txByType,
    };
  }
}