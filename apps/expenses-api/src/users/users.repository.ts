import { Injectable } from '@nestjs/common';

import { InMemoryDrizzleService } from '../database/in-memory-drizzle.service';
import { NewUser, User } from '../database/schemas/users.schema';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: InMemoryDrizzleService) {}

  findByEmail(email: string): Promise<User | undefined> {
    return this.db.findUserByEmail(email);
  }

  findById(id: string): Promise<User | undefined> {
    return this.db.findUserById(id);
  }

  create(input: NewUser): Promise<User> {
    return this.db.insertUser(input);
  }
}
