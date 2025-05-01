import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AssetYieldSchema = z.object({
  ticker: z.string(),
  currentValue: z.number(),
  performance: z.number(),
  quantity: z.number(),
});

export const PortfolioSchema = z.object({
  availableCash: z.number(),
  totalBalance: z.number(),
  assets: z.array(AssetYieldSchema),
});
export class PortfolioOutputDto extends createZodDto(PortfolioSchema) {}
