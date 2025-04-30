import { createZodDto } from 'nestjs-zod';

import { GetInstrumentsFilterSchema } from '../instrument.domain';

export class GetInstrumentsFilterDto extends createZodDto(
  GetInstrumentsFilterSchema,
) {}
