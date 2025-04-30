import { Instrument } from './instrument.domain';

export class MarketData {
  public id: number;
  public instrumentid: number;
  public high: number;
  public low: number;
  public open: number;
  public close: number;
  public previousclose: number;
  public date: Date;
  public instrument?: Instrument;

  constructor(marketdata: any) {
    this.id = marketdata.id;
    this.instrumentid = marketdata.instrumentid;
    this.high = marketdata.high;
    this.low = marketdata.low;
    this.open = marketdata.open;
    this.close = marketdata.close;
    this.previousclose = marketdata.previousclose;
    this.date = marketdata.date;
    this.instrument = marketdata.instrument;
  }
}
