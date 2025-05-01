import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const InstrumentSchema = z.object({
  id: z.number(),
  ticker: z.string(),
  name: z.string(),
  type: z.string(), // si hay un enum real, mejor usarlo acá
});

export const InstrumentsArraySchema = z.array(InstrumentSchema);
export class InstrumentOutputDto extends createZodDto(InstrumentsArraySchema) {}
