import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';
import { users } from '../database/schema';
import type { User } from '../database/schema';
import { BCRYPT_SALT_ROUNDS, DEFAULT_USER_ROLE } from './auth.constants';
import { RegisterDto } from './dto/register.dto';
import type { AuthenticatedUser, AuthResult, JwtPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await hash(dto.password, BCRYPT_SALT_ROUNDS);
    const desiredRole = dto.role ?? DEFAULT_USER_ROLE;

    const [created] = await this.drizzle.db
      .insert(users)
      .values({
        email: dto.email,
        password: passwordHash,
        role: desiredRole,
      })
      .returning();

    const sanitized = this.sanitize(created);

    return {
      user: sanitized,
      accessToken: await this.signToken(sanitized),
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    const existing = await this.findByEmail(email);

    if (!existing) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, existing.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.sanitize(existing);
  }

  async validateUserById(id: string): Promise<AuthenticatedUser> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new UnauthorizedException();
    }

    return this.sanitize(existing);
  }

  async login(user: AuthenticatedUser): Promise<AuthResult> {
    return {
      user,
      accessToken: await this.signToken(user),
    };
  }

  private async findByEmail(email: string): Promise<User | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return result[0];
  }

  private async findById(id: string): Promise<User | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, id));

    return result[0];
  }

  private sanitize(user: User): AuthenticatedUser {
    const { password, ...rest } = user;
    return rest;
  }

  private async signToken(user: AuthenticatedUser): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }
}
