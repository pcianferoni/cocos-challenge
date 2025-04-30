import { CreateBuyOrderDto } from '@broker/domain/dtos/create-buy-order.dto';
import {
  FIAT_ARS_INSTRUMENT_ID,
  Order,
  ORDER_SIDE,
  ORDER_STATUS,
  ORDER_TYPE,
} from '@broker/domain/order.domain';
import { MarketDataPort } from '@broker/domain/ports/market-data.port';
import { OrderPort } from '@broker/domain/ports/order.port';
import { Inject, Injectable } from '@nestjs/common';

import { getAvailableCash } from '../utils/utils';

@Injectable()
export class CreateBuyOrderUseCase {
  constructor(
    @Inject('OrderPort')
    private readonly orderPort: OrderPort,
    @Inject('MarketDataPort')
    private readonly marketDataPort: MarketDataPort,
  ) {}

  async execute(request: CreateBuyOrderDto): Promise<{ message: string }> {
    const { userid, instrumentid, price, size, type, isSizeBased } = request;

    const orders = await this.orderPort.getOrdersByUserId(userid);
    const availableCash = getAvailableCash(orders);
    const lastPrice = await this.marketDataPort.getLastPriceByInstrumentId(
      instrumentid,
    );

    let finalSize: number;
    let totalCost: number;

    if (isSizeBased) {
      if (!size) throw new Error('Missing size for size-based order');
      finalSize = size;
      totalCost = finalSize * lastPrice;
    } else {
      if (!price) throw new Error('Missing price for money-based order');
      finalSize = Math.floor(price / lastPrice);
      if (finalSize <= 0) {
        throw new Error('Insufficient funds to buy at least 1 unit');
      }
      totalCost = finalSize * lastPrice;
    }

    if (availableCash < totalCost) {
      const rejectedOrder = new Order({
        userid,
        instrumentid,
        size: finalSize,
        price: totalCost,
        type,
        side: ORDER_SIDE.BUY,
        status: ORDER_STATUS.REJECTED,
        datetime: new Date(),
      });

      await this.orderPort.createOrder(rejectedOrder);

      return {
        message: 'Order rejected: insufficient funds',
      };
    }

    const buyOrder = new Order({
      userid,
      instrumentid,
      size: finalSize,
      price: lastPrice,
      type,
      side: ORDER_SIDE.BUY,
      status:
        type === ORDER_TYPE.MARKET ? ORDER_STATUS.FILLED : ORDER_STATUS.NEW,
      datetime: new Date(),
    });

    const cashOutOrder = new Order({
      userid,
      instrumentid: FIAT_ARS_INSTRUMENT_ID,
      // totalCost is equal ARS unit
      size: totalCost,
      price: 1,
      type: ORDER_TYPE.MARKET,
      side: ORDER_SIDE.CASH_OUT,
      status: ORDER_STATUS.FILLED,
      datetime: new Date(),
    });

    await Promise.all([
      this.orderPort.createOrder(buyOrder),
      this.orderPort.createOrder(cashOutOrder),
    ]);

    return {
      message: `Your order for ${buyOrder.size} assets was completed successfully`,
    };
  }
}
