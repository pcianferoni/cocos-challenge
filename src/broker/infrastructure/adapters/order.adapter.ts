import { PrismaService } from '@database/prisma-orm/prisma.service';
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import {
  Order,
  ORDER_SIDE,
  ORDER_STATUS,
} from 'src/broker/domain/order.domain';
import { OrderPort } from 'src/broker/domain/ports/order.port';

import { mapEntityToDomain } from '../mappers/order.mapper';

@Injectable()
export class OrderAdapter implements OrderPort {
  private readonly logger = new Logger(OrderAdapter.name);

  constructor(private readonly prisma: PrismaService) {}

  async createOrder(newOrder: Order): Promise<void> {
    try {
      await this.prisma.order.create({
        data: {
          id: newOrder.id,
          size: newOrder.size,
          price: newOrder.price,
          type: newOrder.type,
          side: newOrder.side,
          status: newOrder.status,
          datetime: newOrder.datetime,
          instrumentid: newOrder.instrumentid,
          userid: newOrder.userid,
        },
      });
    } catch (error) {
      this.logger.error('Error creating order', error);
      throw new HttpException(error, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          userid: userId,
          status: {
            notIn: [ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED],
          },
        },
      });

      return orders.map((o) => new Order(o));
    } catch (error) {
      this.logger.error('Error fetching orders by userId', error);
      throw new HttpException(error, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getOrder(orderId: number): Promise<Order> {
    try {
      const order = await this.prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });
      if (!order) {
        throw 'not found';
      }
      return mapEntityToDomain(order);
    } catch (error) {
      this.logger.error('Error fetching orders by userId', error);
      throw new HttpException(error, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async updateOrder(order: Order): Promise<void> {
    try {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: order.status },
      });
    } catch (error) {
      throw new Error(`Failed to update order with ID ${order.id}: ${error}`);
    }
  }

  async getOrdersByInstrument(
    instrumentId: number,
    userId: number,
  ): Promise<Order[]> {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          userid: userId,
          instrumentid: instrumentId,
          side: {
            in: [ORDER_SIDE.BUY, ORDER_SIDE.SELL],
          },
          status: {
            notIn: [
              ORDER_STATUS.CANCELLED,
              ORDER_STATUS.REJECTED,
              ORDER_STATUS.NEW,
            ],
          },
        },
      });

      return orders.map((o) => new Order(o));
    } catch (error) {
      this.logger.error('Error fetching orders by instrument', error);
      throw new HttpException(error, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
