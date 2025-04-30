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
} from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('order')
export class OrderController {
  constructor(
    private readonly createBuyOrderUseCase: CreateBuyOrderUseCase,
    private readonly createSellOrderUseCase: CreateSellOrderUseCase,
    private readonly cancelLimitOrderUseCase: CancelLimitOrderUseCase,
  ) {}
  @Post()
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: CreateBuyOrderUseCase })
  @ApiOperation({
    summary: 'Create an order',
    description:
      'Create a new buy or sell order for the specified instruments.',
  })
  async createOrder(
    @Body() createOrderDto: CreateBuyOrderDto | CreateSellOrderDto,
  ): Promise<any> {
    switch (createOrderDto.side) {
      case ORDER_SIDE.BUY:
        return await this.createBuyOrderUseCase.execute(
          createOrderDto as CreateBuyOrderDto,
        );
      case ORDER_SIDE.SELL:
        return await this.createSellOrderUseCase.execute(
          createOrderDto as CreateSellOrderDto,
        );
      default:
        throw new BadRequestException('Invalid order side');
    }
  }

  @Delete('/:id')
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
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
  async CancelOrder(@Param('id') id: string): Promise<any> {
    return await this.cancelLimitOrderUseCase.execute(parseInt(id));
  }
}
