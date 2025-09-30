import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { NewUser, PublicUser, User } from './schemas/users.schema';

@Injectable()
export class InMemoryDrizzleService {
  private readonly users = new Map<string, User>();

  async insertUser(data: NewUser): Promise<User> {
    const id = data.id ?? randomUUID();
    const timestamps = {
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    };

    const user: User = {
      id,
      email: data.email,
      passwordHash: data.passwordHash,
      ...timestamps,
    };

    this.users.set(id, user);
    return user;
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  async findUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async updateUser(id: string, data: Partial<NewUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: User = {
      ...existing,
      ...data,
      updatedAt: data.updatedAt ?? new Date(),
    } as User;

    this.users.set(id, updated);
    return updated;
  }

  toPublicUser(user: User): PublicUser {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
