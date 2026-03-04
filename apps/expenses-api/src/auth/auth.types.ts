import type { User } from '../database/schema';

export type AuthenticatedUser = Omit<User, 'password'>;

export interface JwtPayload {
  sub: string;
  email: string;
  role: User['role'];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: AuthenticatedUser;
}

export interface AuthResponse {
  user: AuthenticatedUser;
}
