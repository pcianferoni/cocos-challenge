import { GetInstrumentsFilterDto } from '@broker/domain/dtos/get-instruments-filter.dto';
import { Instrument } from '@broker/domain/instrument.domain';
import { InstrumentPort } from '@broker/domain/ports/instrument.port';
import { PrismaService } from '@database/prisma-orm/prisma.service';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class InstrumentAdapter implements InstrumentPort {
  constructor(private readonly prisma: PrismaService) {}

  async getInstruments(filter: GetInstrumentsFilterDto): Promise<Instrument[]> {
    try {
      const instruments = await this.prisma.instrument.findMany({
        where: {
          ...(filter.name
            ? { name: { contains: filter.name, mode: 'insensitive' } }
            : {}),
          ...(filter.ticker
            ? { ticker: { contains: filter.ticker, mode: 'insensitive' } }
            : {}),
        },
      });
      return instruments.map((i) => new Instrument(i));
    } catch (error) {
      throw new HttpException(error, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
