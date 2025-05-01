import { CancelLimitOrderUseCase } from '@broker/application/cancel-limit-order/cancel-limit-order.usecase';
import { CreateBuyOrderUseCase } from '@broker/application/create-buy-order/create-buy-order.usecase';
import { CreateSellOrderUseCase } from '@broker/application/create-sell-order/create-sell-order.usecase';
import { CreateBuyOrderDto } from '@broker/domain/dtos/create-buy-order.dto';
import { CreateSellOrderDto } from '@broker/domain/dtos/create-sell-order.dto';
import { ORDER_SIDE } from '@broker/domain/order.domain';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';

import { UserId } from '../decorators/user-id.decorator';
import { CreateOrderDto } from '../dtos/create-order.dto';

@ApiTags('Orders')
@Controller('order')
export class OrderController {
  constructor(
    private readonly createBuyOrderUseCase: CreateBuyOrderUseCase,
    private readonly createSellOrderUseCase: CreateSellOrderUseCase,
    private readonly cancelLimitOrderUseCase: CancelLimitOrderUseCase,
  ) {}
  @Post()
  @ApiHeader({
    name: 'userId',
    description: 'Id of the user who will generate the order',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: CreateOrderDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: CreateOrderDto })
  @ApiOperation({
    summary: 'Create an order',
    description:
      'Create a new buy or sell order for the specified instruments.',
  })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @UserId() userId: number,
  ): Promise<any> {
    switch (createOrderDto.side) {
      case ORDER_SIDE.BUY:
        return await this.createBuyOrderUseCase.execute(
          userId,
          createOrderDto as CreateBuyOrderDto,
        );
      case ORDER_SIDE.SELL:
        return await this.createSellOrderUseCase.execute(
          userId,
          createOrderDto as CreateSellOrderDto,
        );
      default:
        throw new BadRequestException('Invalid order side');
    }
  }

  @Delete('/:id')
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiParam({
    name: 'id',
    description: 'Order unique identifier',
    type: 'number',
    example: '23',
  })
  @ApiOperation({
    summary: 'Cancel an order',
    description: 'Cancel an limit type order with status "NEW"',
  })
  async CancelOrder(@Param('id') orderId: string): Promise<any> {
    return await this.cancelLimitOrderUseCase.execute(parseInt(orderId));
  }
}
