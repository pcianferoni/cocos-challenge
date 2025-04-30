import { PrismaModule } from '@database/prisma.module';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { UuidModule } from 'nestjs-uuid';
import { ZodValidationPipe } from 'nestjs-zod';

import { CancelLimitOrderUseCase } from './application/cancel-limit-order/cancel-limit-order.usecase';
import { CreateBuyOrderUseCase } from './application/create-buy-order/create-buy-order.usecase';
import { CreateSellOrderUseCase } from './application/create-sell-order/create-sell-order.usecase';
import { GetInstrumentsUseCase } from './application/get-instrument/get-instrument.usecase';
import { GetPortfolioUseCase } from './application/get-portfolio/get-portfolio.usecase';
import { InstrumentAdapter } from './infrastructure/adapters/instrument.adapter';
import { MarketDataAdapter } from './infrastructure/adapters/market-data.adapter';
import { OrderAdapter } from './infrastructure/adapters/order.adapter';
import { InstrumentController } from './infrastructure/controllers/instrument.controller';
import { OrderController } from './infrastructure/controllers/order.controller';
import { PortfolioController } from './infrastructure/controllers/portfolio.controller';

@Module({
  imports: [PrismaModule, UuidModule],
  controllers: [InstrumentController, OrderController, PortfolioController],
  providers: [
    CreateBuyOrderUseCase,
    CreateSellOrderUseCase,
    CancelLimitOrderUseCase,
    GetInstrumentsUseCase,
    GetPortfolioUseCase,
    {
      provide: 'OrderPort',
      useClass: OrderAdapter,
    },
    {
      provide: 'InstrumentPort',
      useClass: InstrumentAdapter,
    },
    {
      provide: 'MarketDataPort',
      useClass: MarketDataAdapter,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class BrokerModule {}
