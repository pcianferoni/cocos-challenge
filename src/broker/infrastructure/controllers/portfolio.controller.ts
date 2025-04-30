import { GetPortfolioUseCase } from '@broker/application/get-portfolio/get-portfolio.usecase';
import { Portfolio } from '@broker/domain/portfolio.domain';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly getPortfolioUseCase: GetPortfolioUseCase) {}

  @Get(':id')
  async getPortfolio(@Param('id') id: string): Promise<Portfolio> {
    return await this.getPortfolioUseCase.execute(parseInt(id));
  }
}
