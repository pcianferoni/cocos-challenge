import { GetInstrumentsUseCase } from '@broker/application/get-instrument/get-instrument.usecase';
import { GetInstrumentsFilterDto } from '@broker/domain/dtos/get-instruments-filter.dto';
import { Instrument } from '@broker/domain/instrument.domain';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('Instruments')
@Controller('instrument')
export class InstrumentController {
  constructor(private readonly getInstrumentsUseCase: GetInstrumentsUseCase) {}

  @Get()
  @ApiResponse({ status: 200, description: 'List of instruments' })
  @ApiOperation({
    summary: 'Gets the assets',
    description:
      'Returns a list of instruments filtered according to the provided parameters.',
  })
  async getAssets(
    @Query() filter: GetInstrumentsFilterDto,
  ): Promise<Instrument[]> {
    return await this.getInstrumentsUseCase.execute(filter);
  }
}
