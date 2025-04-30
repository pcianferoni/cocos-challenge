import { GetInstrumentsFilterDto } from '../dtos/get-instruments-filter.dto';
import { Instrument } from '../instrument.domain';

export interface InstrumentPort {
  getInstruments(filter: GetInstrumentsFilterDto): Promise<Instrument[]>;
}
