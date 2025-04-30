import { Order } from '../order.domain';

export interface OrderPort {
  createOrder(newOrder: Order): Promise<void>;
  updateOrder(orderToUpdate: Order): Promise<void>;
  getOrder(id: number): Promise<Order>;
  getOrdersByUserId: (userId: number) => Promise<Order[]>;
  getOrdersByInstrument(instrumentId: number, userId: number): Promise<Order[]>;
}
