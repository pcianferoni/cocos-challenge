import { ORDER_SIDE, ORDER_TYPE } from '@broker/domain/order.domain';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateOrderDtoSchema = z
  .object({
    instrumentid: z
      .number()
      .min(1, { message: 'Instrument ID must be greater than 0' }),
    side: z.enum([ORDER_SIDE.BUY, ORDER_SIDE.SELL]),
    type: z.nativeEnum(ORDER_TYPE),
    size: z.number().optional(),
    amount: z.number().optional(),
    isSizeBased: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.side === ORDER_SIDE.BUY) {
      if (data.isSizeBased === true) {
        if (data.size == null) {
          ctx.addIssue({
            path: ['size'],
            code: z.ZodIssueCode.custom,
            message:
              'size is required when isSizeBased is true and type is BUY',
          });
        }
      } else {
        if (data.amount == null) {
          ctx.addIssue({
            path: ['amount'],
            code: z.ZodIssueCode.custom,
            message:
              'amount is required when isSizeBased is false and type is BUY',
          });
        }
      }
    } else {
      if (data.size == null) {
        ctx.addIssue({
          path: ['size'],
          code: z.ZodIssueCode.custom,
          message: 'size is required when type is SELL',
        });
      }
    }
  });

export class CreateOrderDto extends createZodDto(CreateOrderDtoSchema) {}
