import { GetPortfolioUseCase } from '@broker/application/get-portfolio/get-portfolio.usecase';
import { Portfolio } from '@broker/domain/portfolio.domain';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UserId } from '../decorators/user-id.decorator';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly getPortfolioUseCase: GetPortfolioUseCase) {}

  @Get()
  async getPortfolio(@UserId() userId: number): Promise<Portfolio> {
    return await this.getPortfolioUseCase.execute(userId);
  }
}
