import { createZodDto } from 'nestjs-zod';

import { CreateSellOrderSchema } from '../order.domain';

export class CreateSellOrderDto extends createZodDto(CreateSellOrderSchema) {}
