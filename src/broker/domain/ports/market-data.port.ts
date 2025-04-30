import { MarketData } from '../market-data.domain';

export interface MarketDataPort {
  getLastPriceByInstrumentId(instrumentid: number): Promise<number>;
  getLastMarketData(instruments?: number[]): Promise<MarketData[]>;
}
