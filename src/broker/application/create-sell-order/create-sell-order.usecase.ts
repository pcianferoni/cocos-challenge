import { CreateSellOrderDto } from '@broker/domain/dtos/create-sell-order.dto';
import {
  FIAT_ARS_INSTRUMENT_ID,
  Order,
  ORDER_SIDE,
  ORDER_STATUS,
  ORDER_TYPE,
} from '@broker/domain/order.domain';
import { MarketDataPort } from '@broker/domain/ports/market-data.port';
import { OrderPort } from '@broker/domain/ports/order.port';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CreateSellOrderUseCase {
  constructor(
    @Inject('OrderPort')
    private readonly orderPort: OrderPort,
    @Inject('MarketDataPort')
    private readonly marketDataPort: MarketDataPort,
  ) {}

  async execute(
    userid,
    request: CreateSellOrderDto,
  ): Promise<{ message: string }> {
    const { instrumentid, size, type } = request;

    try {
      const orders = await this.orderPort.getOrdersByInstrument(
        instrumentid,
        userid,
      );

      if (!orders.length) throw new NotFoundException('Asset not found');

      const availableAssets = orders.reduce((acc, order) => {
        if (order.side === ORDER_SIDE.BUY) return acc + order.size;
        if (order.side === ORDER_SIDE.SELL) return acc - order.size;
        return acc;
      }, 0);

      if (availableAssets < size!)
        throw new BadRequestException('Insufficient assets to sell');

      const lastPrice = await this.marketDataPort.getLastPriceByInstrumentId(
        instrumentid,
      );

      const sellOrder = new Order({
        instrumentid,
        userid,
        size,
        price: lastPrice,
        type,
        side: ORDER_SIDE.SELL,
        status:
          type === ORDER_TYPE.MARKET ? ORDER_STATUS.FILLED : ORDER_STATUS.NEW,
        datetime: new Date(),
      });

      const cashInOrder = new Order({
        userid,
        instrumentid: FIAT_ARS_INSTRUMENT_ID,
        // totalCost is equal ARS unit
        size: lastPrice * size,
        price: 1,
        type: ORDER_TYPE.MARKET,
        side: ORDER_SIDE.CASH_IN,
        status: ORDER_STATUS.FILLED,
        datetime: new Date(),
      });

      await Promise.all([
        this.orderPort.createOrder(sellOrder),
        this.orderPort.createOrder(cashInOrder),
      ]);

      return {
        message: 'Your assets were successfully sold',
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to process sell order');
    }
  }
}
