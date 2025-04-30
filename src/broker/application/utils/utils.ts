/* eslint-disable @typescript-eslint/no-unused-vars */
import { Instrument } from '@broker/domain/instrument.domain';
import { MarketData } from '@broker/domain/market-data.domain';
import { Order, ORDER_SIDE } from '@broker/domain/order.domain';
import { AssetYield } from '@broker/domain/portfolio.domain';
import { HttpException, HttpStatus } from '@nestjs/common';

export const getAvailableCash = (orders: Order[]): number => {
  return orders.reduce((acc, order) => {
    const amount = Number(order.size) * Number(order.price);
    if (order.side === ORDER_SIDE.CASH_IN) {
      return acc + amount;
    } else if (order.side === ORDER_SIDE.CASH_OUT) {
      return acc - amount;
    }
    return acc;
  }, 0);
};

export const calculateAssetYieldsFromOrders = (
  orders: Order[],
  marketData: MarketData[],
): AssetYield[] => {
  try {
    const assetsMap = new Map<
      number,
      {
        quantity: number;
        totalBuyAmount: number;
        ticker: string;
      }
    >();

    const marketDataMap = new Map<number, { close: number; ticker: string }>();
    for (const md of marketData) {
      if (!md.instrumentid) continue;
      marketDataMap.set(md.instrumentid, {
        close: md.close,
        ticker: md.instrument?.ticker ?? 'GEN',
      });
    }

    for (const order of orders) {
      if (!order.isBuyOrSell() || !order.isStatusFilled()) continue;

      const { instrumentid, size, price } = order;
      if (!instrumentid) continue;

      if (!marketDataMap.has(instrumentid)) {
        throw new Error(
          `Missing market data for instrumentId: ${instrumentid}`,
        );
      }

      const { close, ticker } = marketDataMap.get(instrumentid)!;

      if (!assetsMap.has(instrumentid)) {
        assetsMap.set(instrumentid, {
          quantity: 0,
          totalBuyAmount: 0,
          ticker,
        });
      }

      const asset = assetsMap.get(instrumentid)!;

      if (order.isBuy()) {
        asset.quantity += size;
        asset.totalBuyAmount += size * price;
      } else {
        asset.quantity -= size;
      }
    }

    const result: AssetYield[] = [];

    for (const [
      instrumentid,
      { quantity, totalBuyAmount, ticker },
    ] of assetsMap.entries()) {
      if (quantity <= 0) continue;

      const { close } = marketDataMap.get(instrumentid)!;
      const currentValue = quantity * close;
      const averageBuyPrice = totalBuyAmount / (quantity || 1);
      const performance = +(
        ((close - averageBuyPrice) / averageBuyPrice) *
        100
      ).toFixed(2);

      result.push(new AssetYield(ticker, currentValue, performance, quantity));
    }

    return result;
  } catch (error) {
    throw new HttpException(error, HttpStatus.SERVICE_UNAVAILABLE);
  }
};

export const getBalanceInAssets = (assets: AssetYield[]): number => {
  return assets.reduce((acc, assets) => (acc += assets.currentValue), 0);
};

interface IAssetsBalanceFromOrders {
  quantityOfBuy: number;
  currentAssets: number;
  totalBuyAmount: number;
}
