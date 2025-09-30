import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { InMemoryDrizzleService } from '../database/in-memory-drizzle.service';
import { NewUser, PublicUser, User } from '../database/schemas/users.schema';
import { UsersRepository } from './users.repository';

export interface CreateUserInput {
  email: string;
  password: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly db: InMemoryDrizzleService,
  ) {}

  async create(input: CreateUserInput): Promise<PublicUser> {
    const existing = await this.usersRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const createdUser = await this.usersRepository.create({
      email: input.email,
      passwordHash,
    } satisfies NewUser);

    return this.db.toPublicUser(createdUser);
  }

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findById(id);
    return user ?? null;
  }

  toPublicUser(user: User): PublicUser {
    return this.db.toPublicUser(user);
  }
}
