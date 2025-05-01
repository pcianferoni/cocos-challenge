import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { z } from 'zod';

const userIdSchema = z.coerce.number().int().positive({
  message: 'userid must be a positive integer',
});

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    const rawUserId = request.headers['userid'];

    const result = userIdSchema.safeParse(rawUserId);

    if (!result.success) {
      throw new BadRequestException(result.error.issues[0].message);
    }

    return result.data;
  },
);
