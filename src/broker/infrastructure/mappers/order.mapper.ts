import {
  Order,
  ORDER_SIDE,
  ORDER_STATUS,
  ORDER_TYPE,
} from '@broker/domain/order.domain';
import client from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export type OrderEntity = client.Order;

export const mapDomainToEntity = (order: Order): OrderEntity => ({
  id: order.id,
  instrumentid: order.instrumentid,
  userid: order.userid,
  size: order.size,
  price: new Decimal(order.price),
  type: order.type as any,
  side: order.side as any,
  status: order.status as any,
  datetime: new Date(order.datetime),
});

export const mapEntityToDomain = (orderEntity: OrderEntity): Order => {
  return new Order({
    id: orderEntity.id,
    instrumentid: orderEntity.instrumentid,
    userid: orderEntity.userid,
    size: orderEntity.size,
    price: orderEntity.price,
    type: orderEntity.type as ORDER_TYPE,
    side: orderEntity.side as ORDER_SIDE,
    status: orderEntity.status as ORDER_STATUS,
    datetime: orderEntity.datetime
      ? new Date(orderEntity.datetime)
      : new Date(),
  });
};
