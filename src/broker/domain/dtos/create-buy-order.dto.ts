import { createZodDto } from 'nestjs-zod';

import { CreateBuyOrderSchema } from '../order.domain';

export class CreateBuyOrderDto extends createZodDto(CreateBuyOrderSchema) {}
