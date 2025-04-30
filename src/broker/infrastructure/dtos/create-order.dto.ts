import { ORDER_SIDE, ORDER_TYPE } from '@broker/domain/order.domain';
import { z } from 'zod';

export const CreateOrderDtoSchema = z.object({
  instrumentid: z
    .number()
    .min(1, { message: 'Instrument ID must be greater than 0' }),
  side: z.nativeEnum(ORDER_SIDE),
  type: z.nativeEnum(ORDER_TYPE),
  size: z.number(),
  amount: z.number().min(1, { message: 'Amount must be greater than 0' }),
  price: z.number().min(1, { message: 'Price must be greater than 0' }),
});

export type CreateOrderDto = z.infer<typeof CreateOrderDtoSchema>;
