import { User } from '@broker/domain/user.domain';
import client from '@prisma/client';

export type UserEntity = client.User;

export const mapEntityToDomain = (userEntity: UserEntity): User => {
  return new User(
    userEntity.id,
    userEntity.accountnumber ?? undefined,
    userEntity.email ?? undefined,
  );
};
