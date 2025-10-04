import type { UserRole } from '../database/schema';

export const jwtConfig = {
  secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  expiresIn: process.env.JWT_EXPIRES ?? '1h',
};

export const DEFAULT_USER_ROLE: UserRole = 'user';
export const BCRYPT_SALT_ROUNDS = 10;
