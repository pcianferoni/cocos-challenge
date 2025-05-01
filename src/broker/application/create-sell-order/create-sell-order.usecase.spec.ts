import {
  FIAT_ARS_INSTRUMENT_ID,
  Order,
  ORDER_SIDE,
  ORDER_STATUS,
  ORDER_TYPE,
} from '@broker/domain/order.domain';
import { MarketDataPort } from '@broker/domain/ports/market-data.port';
import { OrderPort } from '@broker/domain/ports/order.port';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateSellOrderUseCase } from './create-sell-order.usecase';

// Mock type definition
type MockType<T> = {
  [P in keyof T]: jest.Mock<any>;
};

// Mock factory for OrderPort
const createOrderPortMock = (): MockType<OrderPort> => ({
  getOrdersByUserId: jest.fn(),
  createOrder: jest.fn(),
  updateOrder: jest.fn(),
  getOrder: jest.fn(),
  getOrdersByInstrument: jest.fn(),
});

// Mock factory for MarketDataPort
const createMarketDataPortMock = (): MockType<MarketDataPort> => ({
  getLastPriceByInstrumentId: jest.fn(),
  getLastMarketData: jest.fn(),
});

describe('CreateSellOrderUseCase', () => {
  let useCase: CreateSellOrderUseCase;
  let orderPort: MockType<OrderPort>;
  let marketDataPort: MockType<MarketDataPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSellOrderUseCase,
        {
          provide: 'OrderPort',
          useFactory: createOrderPortMock,
        },
        {
          provide: 'MarketDataPort',
          useFactory: createMarketDataPortMock,
        },
      ],
    }).compile();

    useCase = module.get<CreateSellOrderUseCase>(CreateSellOrderUseCase);
    orderPort = module.get('OrderPort');
    marketDataPort = module.get('MarketDataPort');

    // TODO AFTER EACH
    jest.clearAllMocks();
  });

  describe('Successful Sell Order', () => {
    it('should create a sell order with sufficient instruments available', async () => {
      // Arrange
      const userId = 1;
      const instrumentId = 2;
      const sellSize = 5;
      const lastPrice = 100;

      // Mock user having more instruments than trying to sell
      orderPort.getOrdersByInstrument.mockResolvedValue([
        new Order({
          userid: userId,
          instrumentid: instrumentId,
          size: 10,
          price: 90,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.BUY,
          status: ORDER_STATUS.FILLED,
          datetime: new Date(),
        }),
      ]);

      marketDataPort.getLastPriceByInstrumentId.mockResolvedValue(lastPrice);
      orderPort.createOrder.mockImplementation((order) =>
        Promise.resolve(order),
      );

      // Act
      const result = await useCase.execute(userId, {
        instrumentid: instrumentId,
        size: sellSize,
        type: ORDER_TYPE.MARKET,
        side: ORDER_SIDE.SELL,
      });

      // Assert
      expect(orderPort.getOrdersByInstrument).toHaveBeenCalledWith(
        instrumentId,
        userId,
      );
      expect(marketDataPort.getLastPriceByInstrumentId).toHaveBeenCalledWith(
        instrumentId,
      );

      // Verify sell order creation
      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userid: userId,
          instrumentid: instrumentId,
          size: sellSize,
          price: lastPrice,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.SELL,
          status: ORDER_STATUS.FILLED,
        }),
      );
      // Verify cashin order creation
      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userid: userId,
          instrumentid: FIAT_ARS_INSTRUMENT_ID,
          size: lastPrice * sellSize,
          price: 1,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.CASH_IN,
          status: ORDER_STATUS.FILLED,
        }),
      );

      expect(orderPort.createOrder).toHaveBeenCalledTimes(2);
      expect((await result).message).toEqual(
        'Your assets were successfully sold',
      );
    });

    it('should create a sell order when multiple buy orders exist', async () => {
      // Arrange
      const userId = 1;
      const instrumentId = 2;
      const sellSize = 15;
      const lastPrice = 100;

      // Mock user having bought instruments in multiple orders

      orderPort.getOrdersByInstrument.mockResolvedValue([
        new Order({
          userid: userId,
          instrumentid: instrumentId,
          size: 10,
          price: 90,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.BUY,
          status: ORDER_STATUS.FILLED,
          datetime: new Date('2024-01-01'),
        }),
        new Order({
          userid: userId,
          instrumentid: instrumentId,
          size: 8,
          price: 95,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.BUY,
          status: ORDER_STATUS.FILLED,
          datetime: new Date('2024-01-02'),
        }),
      ]);

      marketDataPort.getLastPriceByInstrumentId.mockResolvedValue(lastPrice);
      orderPort.createOrder.mockImplementation((order) =>
        Promise.resolve(order),
      );

      // Act
      const result = await useCase.execute(userId, {
        instrumentid: instrumentId,
        size: sellSize,
        type: ORDER_TYPE.MARKET,
        side: ORDER_SIDE.SELL,
      });

      // Assert
      // Verify sell order creation
      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userid: userId,
          instrumentid: instrumentId,
          size: sellSize,
          price: lastPrice,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.SELL,
          status: ORDER_STATUS.FILLED,
        }),
      );
      // Verify cashin order creation
      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userid: userId,
          instrumentid: FIAT_ARS_INSTRUMENT_ID,
          size: lastPrice * sellSize,
          price: 1,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.CASH_IN,
          status: ORDER_STATUS.FILLED,
        }),
      );

      expect(orderPort.createOrder).toHaveBeenCalledTimes(2);
      expect(result.message).toEqual('Your assets were successfully sold');
    });

    it('should create a limit sell order with NEW status', async () => {
      // Arrange
      const userId = 1;
      const instrumentId = 2;
      const sellSize = 5;
      const lastPrice = 100;

      // Mock user having more instruments than trying to sell
      orderPort.getOrdersByInstrument.mockResolvedValue([
        new Order({
          userid: userId,
          instrumentid: instrumentId,
          size: 10, // Has 10 instruments
          price: 90,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.BUY,
          status: ORDER_STATUS.FILLED,
          datetime: new Date(),
        }),
      ]);

      marketDataPort.getLastPriceByInstrumentId.mockResolvedValue(lastPrice);
      orderPort.createOrder.mockImplementation((order) =>
        Promise.resolve(order),
      );

      // Act
      const result = await useCase.execute(userId, {
        instrumentid: instrumentId,
        size: sellSize,
        type: ORDER_TYPE.LIMIT,
        side: ORDER_SIDE.SELL,
      });

      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userid: userId,
          instrumentid: instrumentId,
          size: sellSize,
          price: lastPrice,
          type: ORDER_TYPE.LIMIT,
          side: ORDER_SIDE.SELL,
          status: ORDER_STATUS.NEW,
        }),
      );
      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          side: ORDER_SIDE.CASH_IN,
          size: lastPrice * sellSize,
          status: ORDER_STATUS.FILLED,
          type: ORDER_TYPE.MARKET,
          userid: 1,
        }),
      );

      expect(orderPort.createOrder).toHaveBeenCalledTimes(2);
      expect(result.message).toEqual('Your assets were successfully sold');
    });

    it('should handle multiple instrument types correctly', async () => {
      // Arrange
      const userId = 1;
      const instrumentId = 2;
      const otherInstrumentId = 3;
      const sellSize = 5;
      const lastPrice = 100;

      // Mock user having both the target instrument and other instruments
      orderPort.getOrdersByInstrument.mockResolvedValue([
        // Target instrument
        new Order({
          userid: userId,
          instrumentid: instrumentId,
          size: 10,
          price: 90,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.BUY,
          status: ORDER_STATUS.FILLED,
          datetime: new Date(),
        }),
        // Different instrument (should be ignored in balance calculation)
        new Order({
          userid: userId,
          instrumentid: otherInstrumentId,
          size: 5,
          price: 95,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.BUY,
          status: ORDER_STATUS.FILLED,
          datetime: new Date(),
        }),
      ]);

      marketDataPort.getLastPriceByInstrumentId.mockResolvedValue(lastPrice);
      orderPort.createOrder.mockImplementation((order) =>
        Promise.resolve(order),
      );

      // Act
      const result = await useCase.execute(userId, {
        instrumentid: instrumentId, // Only selling the target instrument
        size: sellSize,
        type: ORDER_TYPE.MARKET,
        side: ORDER_SIDE.SELL,
      });

      // Assert
      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userid: userId,
          instrumentid: instrumentId,
          size: sellSize,
          price: lastPrice,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.SELL,
          status: ORDER_STATUS.FILLED,
        }),
      );
      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          side: ORDER_SIDE.CASH_IN,
          size: lastPrice * sellSize,
          status: ORDER_STATUS.FILLED,
          type: ORDER_TYPE.MARKET,
          userid: 1,
        }),
      );
      expect(orderPort.createOrder).toHaveBeenCalledTimes(2);
      expect(result.message).toEqual('Your assets were successfully sold');
    });
  });

  describe('Failed Sell Order Scenarios', () => {
    it('should reject order when insufficient instruments are available', async () => {
      // Arrange
      const userId = 1;
      const instrumentId = 2;
      const sellSize = 10;

      // Mock user having less instruments than trying to sell
      orderPort.getOrdersByInstrument.mockResolvedValue([
        new Order({
          userid: userId,
          instrumentid: instrumentId,
          size: 5,
          price: 90,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.BUY,
          status: ORDER_STATUS.FILLED,
          datetime: new Date(),
        }),
      ]);

      try {
        await useCase.execute(userId, {
          instrumentid: instrumentId,
          size: sellSize,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.SELL,
        });
      } catch (error) {
        expect(orderPort.createOrder).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toContain('Insufficient assets to sell');
      }
    });

    it('should reject order when no instruments are available', async () => {
      // Arrange
      const userId = 1;
      const instrumentId = 2;
      const sellSize = 5;

      // Mock user having no instruments
      orderPort.getOrdersByInstrument.mockResolvedValue([]);

      try {
        await useCase.execute(userId, {
          instrumentid: instrumentId,
          size: sellSize,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.SELL,
        });
      } catch (error) {
        expect(orderPort.createOrder).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain('Asset not found');
      }
    });

    it('should consider previous sell orders when calculating available instruments', async () => {
      // Arrange
      const userId = 1;
      const instrumentId = 2;
      const sellSize = 6;

      // Mock user try to buy 10 but has only 5
      orderPort.getOrdersByInstrument.mockResolvedValue([
        new Order({
          userid: userId,
          instrumentid: instrumentId,
          size: 10,
          price: 90,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.BUY,
          status: ORDER_STATUS.FILLED,
          datetime: new Date('2024-01-01'),
        }),
        new Order({
          userid: userId,
          instrumentid: instrumentId,
          size: 5,
          price: 95,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.SELL,
          status: ORDER_STATUS.FILLED,
          datetime: new Date('2024-01-02'),
        }),
      ]);

      try {
        await useCase.execute(userId, {
          instrumentid: instrumentId,
          size: sellSize,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.SELL,
        });
      } catch (error) {
        expect(orderPort.createOrder).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toContain('Insufficient assets to sell');
      }
    });
  });
});
