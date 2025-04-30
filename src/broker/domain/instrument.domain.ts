import z from 'zod';

export class Instrument {
  public id: number;
  public ticker: string;
  public name: string;
  public type: string;

  constructor(instrument: any) {
    this.id = instrument.id;
    this.ticker = instrument.ticker;
    this.name = instrument.name;
    this.type = instrument.type;
  }
}

export const GetInstrumentsFilterSchema = z.object({
  name: z.string().optional(),
  ticker: z.string().optional(),
});
