import { GetPortfolioUseCase } from '@broker/application/get-portfolio/get-portfolio.usecase';
import { Controller, Get } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserId } from '../decorators/user-id.decorator';
import { PortfolioOutputDto } from '../dtos/portfolio-output.dto';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly getPortfolioUseCase: GetPortfolioUseCase) {}
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Portfolio generated successfully',
    type: PortfolioOutputDto,
  })
  @ApiHeader({
    name: 'userId',
    description: 'ID of the user whose portfolio is being requested',
    required: true,
  })
  async getPortfolio(@UserId() userId: number): Promise<PortfolioOutputDto> {
    return await this.getPortfolioUseCase.execute(userId);
  }
}
