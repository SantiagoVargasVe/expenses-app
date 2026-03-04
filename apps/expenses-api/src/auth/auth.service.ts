import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { DrizzleService } from '../database/drizzle.service';
import { accounts, authSessions, users } from '../database/schema';
import type { User } from '../database/schema';
import { BCRYPT_SALT_ROUNDS, DEFAULT_USER_ROLE } from './auth.constants';
import { RegisterDto } from './dto/register.dto';
import type { AuthenticatedUser, AuthResult, JwtPayload } from './auth.types';

interface SessionMetadata {
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterDto,
    meta?: SessionMetadata,
  ): Promise<AuthResult> {
    const existing = await this.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await hash(dto.password, BCRYPT_SALT_ROUNDS);
    const desiredRole = dto.role ?? DEFAULT_USER_ROLE;

    const created = await this.drizzle.db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          email: dto.email,
          password: passwordHash,
          role: desiredRole,
        })
        .returning();

      if (!newUser) {
        throw new ConflictException('Unable to create user');
      }

      await tx.insert(accounts).values({
        userId: newUser.id,
        name: 'Savings',
        type: 'savings',
        balance: '0',
        currency: 'COP',
        updatedAt: new Date(),
      });

      return newUser;
    });

    const sanitized = this.sanitize(created);
    const refreshToken = await this.createSession(sanitized.id, meta);

    return {
      user: sanitized,
      accessToken: await this.signToken(sanitized),
      refreshToken,
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

  async login(
    user: AuthenticatedUser,
    meta?: SessionMetadata,
  ): Promise<AuthResult> {
    const refreshToken = await this.createSession(user.id, meta);

    return {
      user,
      accessToken: await this.signToken(user),
      refreshToken,
    };
  }

  async refreshSession(
    refreshToken: string,
    meta?: SessionMetadata,
  ): Promise<AuthResult> {
    const { sessionId } = this.parseRefreshToken(refreshToken);
    const session = await this.findSessionById(sessionId);

    if (!session || session.revokedAt) {
      throw new UnauthorizedException('Session expired');
    }

    const tokenMatches = session.tokenHash === this.hashToken(refreshToken);

    if (!tokenMatches) {
      await this.revokeSession(sessionId);
      throw new UnauthorizedException('Session revoked');
    }

    const user = await this.findById(session.userId);

    if (!user) {
      await this.revokeSession(sessionId);
      throw new UnauthorizedException('Session user missing');
    }

    const rotatedToken = this.createRefreshToken(sessionId);
    await this.rotateSession(sessionId, rotatedToken, meta);

    const sanitized = this.sanitize(user);

    return {
      user: sanitized,
      accessToken: await this.signToken(sanitized),
      refreshToken: rotatedToken,
    };
  }

  async revokeSessionByToken(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const { sessionId } = this.parseRefreshToken(refreshToken);
    await this.revokeSession(sessionId);
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

  private async findSessionById(sessionId: string) {
    const result = await this.drizzle.db
      .select()
      .from(authSessions)
      .where(eq(authSessions.id, sessionId));

    return result[0];
  }

  private sanitize(user: User): AuthenticatedUser {
    const { password, ...rest } = user;
    void password;
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

  private createRefreshToken(sessionId: string): string {
    const nonce = randomBytes(32).toString('hex');
    return `${sessionId}.${nonce}`;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseRefreshToken(token: string): { sessionId: string } {
    const [sessionId, nonce] = token.split('.');

    if (!sessionId || !nonce) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return { sessionId };
  }

  private async createSession(
    userId: string,
    meta?: SessionMetadata,
  ): Promise<string> {
    const sessionId = randomUUID();
    const refreshToken = this.createRefreshToken(sessionId);
    const tokenHash = this.hashToken(refreshToken);

    await this.drizzle.db.insert(authSessions).values({
      id: sessionId,
      userId,
      tokenHash,
      userAgent: meta?.userAgent,
      ip: meta?.ip,
    });

    return refreshToken;
  }

  private async rotateSession(
    sessionId: string,
    refreshToken: string,
    meta?: SessionMetadata,
  ): Promise<void> {
    await this.drizzle.db
      .update(authSessions)
      .set({
        tokenHash: this.hashToken(refreshToken),
        rotatedAt: new Date(),
        userAgent: meta?.userAgent,
        ip: meta?.ip,
      })
      .where(eq(authSessions.id, sessionId));
  }

  private async revokeSession(sessionId: string): Promise<void> {
    await this.drizzle.db
      .update(authSessions)
      .set({
        revokedAt: new Date(),
      })
      .where(eq(authSessions.id, sessionId));
  }
}
