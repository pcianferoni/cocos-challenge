import { User } from '../user.domain';

export interface UserPort {
  getUser(id: number): Promise<User>;
}
