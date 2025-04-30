import { Module } from '@nestjs/common';

import { PrismaService } from './prisma-orm/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
