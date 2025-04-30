import { InstrumentPort } from '@broker/domain/ports/instrument.port';
import { Inject, Injectable } from '@nestjs/common';
import { GetInstrumentsFilterDto } from 'src/broker/domain/dtos/get-instruments-filter.dto';
import { Instrument } from 'src/broker/domain/instrument.domain';

@Injectable()
export class GetInstrumentsUseCase {
  constructor(
    @Inject('InstrumentPort')
    private readonly instrumentPort: InstrumentPort,
  ) {}

  async execute(filters: GetInstrumentsFilterDto): Promise<Instrument[]> {
    return this.instrumentPort.getInstruments(filters);
  }
}
