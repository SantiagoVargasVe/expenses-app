import type { CookieOptions } from 'express';
import type { UserRole } from '../database/schema';

export const jwtConfig = {
  secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  expiresIn: process.env.JWT_EXPIRES ?? '15m',
};

export const DEFAULT_USER_ROLE: UserRole = 'user';
export const BCRYPT_SALT_ROUNDS = 10;

export const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

const refreshTokenTtlDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30);
export const REFRESH_TOKEN_TTL_MS =
  Number.isFinite(refreshTokenTtlDays) && refreshTokenTtlDays > 0
    ? refreshTokenTtlDays * 24 * 60 * 60 * 1000
    : 30 * 24 * 60 * 60 * 1000;

const authCookieSecure = process.env.AUTH_COOKIE_SECURE === 'true';

export const ACCESS_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: authCookieSecure,
  path: '/',
};

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: authCookieSecure,
  path: '/api/v1/auth',
  maxAge: REFRESH_TOKEN_TTL_MS,
};
