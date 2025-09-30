import { BadRequestException, Injectable } from '@nestjs/common';

import { PublicUser, User } from '../database/schemas/users.schema';
import { UsersService } from '../users/users.service';
import { RegisterAuthDto } from './dto/register-auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(input: RegisterAuthDto): Promise<PublicUser> {
    if (!input.email || !input.password) {
      throw new BadRequestException('Email and password are required');
    }

    return this.usersService.create({
      email: input.email,
      password: input.password,
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    if (!email || !password) {
      return null;
    }

    return this.usersService.validateCredentials(email, password);
  }

  async login(user: User): Promise<{ user: PublicUser }> {
    return {
      user: this.usersService.toPublicUser(user),
    };
  }
}
