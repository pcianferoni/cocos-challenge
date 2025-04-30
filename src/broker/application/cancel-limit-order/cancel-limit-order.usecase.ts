import {
  FIAT_ARS_INSTRUMENT_ID,
  Order,
  ORDER_SIDE,
  ORDER_STATUS,
  ORDER_TYPE,
} from '@broker/domain/order.domain';
import { OrderPort } from '@broker/domain/ports/order.port';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class CancelLimitOrderUseCase {
  constructor(
    @Inject('OrderPort')
    private readonly orderPort: OrderPort,
  ) {}

  async execute(id: number): Promise<{ message: string }> {
    try {
      const order = await this.orderPort.getOrder(id);
      if (order.status !== ORDER_STATUS.NEW) throw 'Unable to cancel';
      // Order CASH_IN
      const totalAmount = order.price * order.size;
      const cashInOrder = new Order({
        instrumentid: FIAT_ARS_INSTRUMENT_ID,
        type: ORDER_TYPE.MARKET,
        side: ORDER_SIDE.CASH_IN,
        size: totalAmount,
        price: 1,
        userid: order.userid,
        status: ORDER_STATUS.FILLED,
        datetime: new Date(),
      });
      order.status = ORDER_STATUS.CANCELLED;

      await Promise.all([
        this.orderPort.createOrder(cashInOrder),
        this.orderPort.updateOrder(order),
      ]);

      return {
        message: 'Your order were successfully cancelled',
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to cancel buy order');
    }
  }
}
