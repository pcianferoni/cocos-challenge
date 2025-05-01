import {
  FIAT_ARS_INSTRUMENT_ID,
  Order,
  ORDER_SIDE,
  ORDER_STATUS,
  ORDER_TYPE,
} from '@broker/domain/order.domain';
import { MarketDataPort } from '@broker/domain/ports/market-data.port';
import { OrderPort } from '@broker/domain/ports/order.port';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateBuyOrderUseCase } from './create-buy-order.usecase';

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

describe('CreateBuyOrderUseCase', () => {
  let useCase: CreateBuyOrderUseCase;
  let orderPort: MockType<OrderPort>;
  let marketDataPort: MockType<MarketDataPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBuyOrderUseCase,
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

    useCase = module.get<CreateBuyOrderUseCase>(CreateBuyOrderUseCase);
    orderPort = module.get('OrderPort');
    marketDataPort = module.get('MarketDataPort');
  });

  describe('Successful Market Buy Order', () => {
    it('should create a market buy order with sufficient funds (size-based)', async () => {
      // Arrange
      const userId = 1;
      const instrumentId = 2;
      const size = 10;
      const lastPrice = 100;
      const totalCost = size * lastPrice;

      // Mock existing orders for available cash calculation
      orderPort.getOrdersByUserId.mockResolvedValue([
        new Order({
          userid: userId,
          instrumentid: FIAT_ARS_INSTRUMENT_ID,
          size: 2000, // Available cash
          price: 1,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.CASH_IN,
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
        size,
        type: ORDER_TYPE.MARKET,
        side: ORDER_SIDE.BUY,
        isSizeBased: true,
      });

      // Assert
      expect(orderPort.getOrdersByUserId).toHaveBeenCalledWith(userId);
      expect(marketDataPort.getLastPriceByInstrumentId).toHaveBeenCalledWith(
        instrumentId,
      );

      // Verify buy order
      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userid: userId,
          instrumentid: instrumentId,
          size,
          price: lastPrice,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.BUY,
          status: ORDER_STATUS.FILLED,
        }),
      );

      // Verify cash-out order
      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userid: userId,
          instrumentid: FIAT_ARS_INSTRUMENT_ID,
          size: totalCost,
          price: 1,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.CASH_OUT,
          status: ORDER_STATUS.FILLED,
        }),
      );

      expect(result.message).toEqual(
        `Your order for ${size} assets was completed successfully`,
      );
    });

    it('should create a market buy order with sufficient funds (money-based)', async () => {
      // Arrange
      const userId = 1;
      const instrumentId = 2;
      const amount = 1000;
      const lastPrice = 100;
      const calculatedSize = Math.floor(amount / lastPrice); // 10 units
      const totalCost = calculatedSize * lastPrice;

      orderPort.getOrdersByUserId.mockResolvedValue([
        new Order({
          userid: userId,
          instrumentid: FIAT_ARS_INSTRUMENT_ID,
          size: 2000, // Available cash
          price: 1,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.CASH_IN,
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
        amount,
        type: ORDER_TYPE.MARKET,
        side: ORDER_SIDE.BUY,
        isSizeBased: false,
      });

      // Assert
      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userid: userId,
          instrumentid: instrumentId,
          size: calculatedSize,
          price: lastPrice,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.BUY,
          status: ORDER_STATUS.FILLED,
        }),
      );

      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userid: userId,
          instrumentid: FIAT_ARS_INSTRUMENT_ID,
          size: totalCost,
          side: ORDER_SIDE.CASH_OUT,
        }),
      );

      expect(result.message).toEqual(
        `Your order for ${calculatedSize} assets was completed successfully`,
      );
    });
  });

  describe('Successful Limit Buy Order', () => {
    it('should create a limit buy order with NEW status', async () => {
      // Arrange
      const userId = 1;
      const instrumentId = 2;
      const size = 10;
      const lastPrice = 100;
      const totalCost = size * lastPrice;

      orderPort.getOrdersByUserId.mockResolvedValue([
        new Order({
          userid: userId,
          instrumentid: FIAT_ARS_INSTRUMENT_ID,
          size: 2000, // Available cash
          price: 1,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.CASH_IN,
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
        size,
        type: ORDER_TYPE.LIMIT,
        side: ORDER_SIDE.BUY,
        isSizeBased: true,
      });

      // Assert
      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userid: userId,
          instrumentid: instrumentId,
          size,
          price: lastPrice,
          type: ORDER_TYPE.LIMIT,
          side: ORDER_SIDE.BUY,
          status: ORDER_STATUS.NEW, // Limit orders should be NEW
        }),
      );

      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userid: userId,
          instrumentid: FIAT_ARS_INSTRUMENT_ID,
          type: ORDER_TYPE.MARKET,
          size: totalCost,
          side: ORDER_SIDE.CASH_OUT,
        }),
      );

      expect(result.message).toEqual(
        `Your order for ${size} assets was completed successfully`,
      );
    });
  });

  describe('Failed Order Scenarios', () => {
    it('should reject order when insufficient funds', async () => {
      // Arrange
      const userId = 1;
      const instrumentId = 2;
      const size = 10;
      const lastPrice = 100;
      const totalCost = size * lastPrice;

      // Mock user has less available cash than needed
      orderPort.getOrdersByUserId.mockResolvedValue([
        new Order({
          userid: userId,
          instrumentid: FIAT_ARS_INSTRUMENT_ID,
          size: 500, // Available cash - less than needed (1000)
          price: 1,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.CASH_IN,
          status: ORDER_STATUS.FILLED,
          datetime: new Date(),
        }),
      ]);

      marketDataPort.getLastPriceByInstrumentId.mockResolvedValue(lastPrice);

      // Act
      const result = await useCase.execute(userId, {
        instrumentid: instrumentId,
        size,
        type: ORDER_TYPE.MARKET,
        side: ORDER_SIDE.BUY,
        isSizeBased: true,
      });

      // Assert
      // Verify rejected order was created
      expect(orderPort.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userid: userId,
          instrumentid: instrumentId,
          size,
          price: totalCost,
          side: ORDER_SIDE.BUY,
          status: ORDER_STATUS.REJECTED,
        }),
      );

      expect(orderPort.createOrder).toHaveBeenCalledTimes(1); // Only rejected order, no cash-out
      expect(result.message).toEqual('Order rejected: insufficient funds');
    });

    it('should throw error when size is missing for size-based order', async () => {
      // Arrange
      const userId = 1;
      const instrumentId = 2;

      orderPort.getOrdersByUserId.mockResolvedValue([
        new Order({
          userid: userId,
          instrumentId,
          size: 500, // Available cash - less than needed (1000)
          price: 1,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.CASH_IN,
          status: ORDER_STATUS.FILLED,
          datetime: new Date(),
        }),
      ]);

      // Act & Assert
      await expect(
        useCase.execute(userId, {
          instrumentid: instrumentId,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.BUY,
          isSizeBased: true,
          // size is missing
        }),
      ).rejects.toThrow('Missing size for size-based order');
    });

    it('should throw error when price is missing for money-based order', async () => {
      // Arrange
      const userId = 1;
      const instrumentId = 2;

      orderPort.getOrdersByUserId.mockResolvedValue([
        new Order({
          userid: userId,
          instrumentId,
          size: 500, // Available cash - less than needed (1000)
          price: 1,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.CASH_IN,
          status: ORDER_STATUS.FILLED,
          datetime: new Date(),
        }),
      ]);

      // Act & Assert
      await expect(
        useCase.execute(userId, {
          instrumentid: instrumentId,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.BUY,
          isSizeBased: false,
          // price is missing
        }),
      ).rejects.toThrow('Missing price for money-based order');
    });

    it('should throw error when calculated size is 0 for money-based order', async () => {
      // Arrange
      const userId = 1;
      const instrumentId = 2;
      const amount = 50; // Not enough to buy 1 unit
      const lastPrice = 100;

      orderPort.getOrdersByUserId.mockResolvedValue([
        new Order({
          userid: userId,
          instrumentid: FIAT_ARS_INSTRUMENT_ID,
          size: 2000,
          price: 1,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.CASH_IN,
          status: ORDER_STATUS.FILLED,
          datetime: new Date(),
        }),
      ]);

      marketDataPort.getLastPriceByInstrumentId.mockResolvedValue(lastPrice);

      // Act & Assert
      await expect(
        useCase.execute(userId, {
          instrumentid: instrumentId,
          amount,
          type: ORDER_TYPE.MARKET,
          side: ORDER_SIDE.BUY,
          isSizeBased: false,
        }),
      ).rejects.toThrow('Insufficient funds to buy at least 1 unit');
    });
  });
});
