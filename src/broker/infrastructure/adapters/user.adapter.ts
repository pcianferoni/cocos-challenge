import { UserPort } from '@broker/domain/ports/user.port';
import { User } from '@broker/domain/user.domain';
import { PrismaService } from '@database/prisma-orm/prisma.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { mapEntityToDomain } from '../mappers/user.mapper';

@Injectable()
export class UserAdapter implements UserPort {
  private readonly logger = new Logger(UserAdapter.name);

  constructor(private readonly prisma: PrismaService) {}
  async getUser(id: number): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        this.logger.error(`User not found. Id: ${id}`);
        throw new NotFoundException('User not found');
      }
      return mapEntityToDomain(user);
    } catch (error) {
      throw error;
    }
  }
}
