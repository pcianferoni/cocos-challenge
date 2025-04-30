import { MarketData } from '@broker/domain/market-data.domain';
import { MarketDataPort } from '@broker/domain/ports/market-data.port';
import { PrismaService } from '@database/prisma-orm/prisma.service';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class MarketDataAdapter implements MarketDataPort {
  private readonly logger = new Logger(MarketDataAdapter.name);

  constructor(private readonly prisma: PrismaService) {}

  async getLastPriceByInstrumentId(instrumentId: number): Promise<number> {
    try {
      const marketData = await this.prisma.marketData.findFirst({
        where: { instrumentid: instrumentId },
      });

      if (!marketData) {
        this.logger.error(
          `No market data found for instrumentId ${instrumentId}`,
        );
        throw new Error('Market data not found');
      }

      return Number(marketData.close);
    } catch (error) {
      this.logger.error('Error fetching last market data', error);
      throw new Error('Error fetching market data');
    }
  }

  async getLastMarketData(instruments?: number[]): Promise<MarketData[]> {
    try {
      const whereClause: Prisma.MarketDataWhereInput = {};

      if (instruments?.length) {
        whereClause.instrumentid = { in: instruments };
      }

      const data = await this.prisma.marketData.findMany({
        where: whereClause,
        include: {
          instrument: true,
        },
      });

      return data.map((raw) => new MarketData(raw));
    } catch (error) {
      throw new HttpException(error, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
