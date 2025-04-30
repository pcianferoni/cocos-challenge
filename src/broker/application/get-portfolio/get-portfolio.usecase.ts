import { Injectable, Inject } from '@nestjs/common';

import { Portfolio } from '../../domain/portfolio.domain';
import { MarketDataPort } from '../../domain/ports/market-data.port';
import { OrderPort } from '../../domain/ports/order.port';
import {
  calculateAssetYieldsFromOrders,
  getAvailableCash,
  getBalanceInAssets,
} from '../utils/utils';

@Injectable()
export class GetPortfolioUseCase {
  constructor(
    @Inject('OrderPort')
    private readonly orderPort: OrderPort,
    @Inject('MarketDataPort')
    private readonly marketDataPort: MarketDataPort,
  ) {}

  async execute(userId: number): Promise<Portfolio> {
    const orders = await this.orderPort.getOrdersByUserId(userId);
    const availableCash = getAvailableCash(orders);
    const instrumentIds = Array.from(
      new Set(
        orders
          .filter((o) => o.isBuyOrSell() && o.isStatusFilled())
          .map((o) => o.instrumentid),
      ),
    );
    const marketData = await this.marketDataPort.getLastMarketData(
      instrumentIds,
    );

    const assetsDetails = await calculateAssetYieldsFromOrders(
      orders,
      marketData,
    );

    const assetsValue = getBalanceInAssets(assetsDetails);

    return new Portfolio(
      availableCash,
      availableCash + assetsValue,
      assetsDetails,
    );
  }
}
