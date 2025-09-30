import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';

export enum TokenVerificationResult {
  Valid = 'valid',
  Expired = 'expired',
  Invalid = 'invalid',
}

export interface TokenPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  [key: string]: unknown;
}

interface VerificationSuccess {
  status: TokenVerificationResult.Valid;
  sub: string;
  email: string;
  payload: TokenPayload;
}

interface VerificationFailure {
  status: TokenVerificationResult.Expired | TokenVerificationResult.Invalid;
}

export type VerificationOutcome = VerificationSuccess | VerificationFailure;

@Injectable()
export class TokenService {
  private readonly secret: string;
  private readonly expiresInSeconds: number;

  constructor(private readonly configService: ConfigService) {
    this.secret = configService.get<string>('JWT_SECRET') ?? 'dev-secret';
    this.expiresInSeconds = this.parseExpiration(
      configService.get<string>('JWT_EXPIRES_IN') ?? '1h',
    );
  }

  sign(
    payload: Pick<TokenPayload, 'sub' | 'email'> & Record<string, unknown>,
  ): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const issuedAt = Math.floor(Date.now() / 1000);
    const fullPayload: TokenPayload = {
      ...payload,
      iat: issuedAt,
      exp: issuedAt + this.expiresInSeconds,
    } as TokenPayload;

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));
    const signature = this.signSegments(encodedHeader, encodedPayload);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verify(token: string): VerificationOutcome {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { status: TokenVerificationResult.Invalid };
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = this.signSegments(encodedHeader, encodedPayload);

    if (signature !== expectedSignature) {
      return { status: TokenVerificationResult.Invalid };
    }

    try {
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as TokenPayload;

      if (typeof payload.exp !== 'number' || typeof payload.sub !== 'string') {
        return { status: TokenVerificationResult.Invalid };
      }

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return { status: TokenVerificationResult.Expired };
      }

      return {
        status: TokenVerificationResult.Valid,
        sub: payload.sub,
        email: String(payload.email ?? ''),
        payload,
      };
    } catch (error) {
      return { status: TokenVerificationResult.Invalid };
    }
  }

  private base64UrlEncode(value: string): string {
    return Buffer.from(value).toString('base64url');
  }

  private signSegments(header: string, payload: string): string {
    return createHmac('sha256', this.secret)
      .update(`${header}.${payload}`)
      .digest('base64url');
  }

  private parseExpiration(value: string): number {
    if (!value) {
      return 3600;
    }

    const match = value.trim().match(/^(\d+)([smhd]?)$/i);
    if (!match) {
      return Number.isNaN(Number(value)) ? 3600 : Number(value);
    }

    const amount = Number(match[1]);
    const unit = match[2]?.toLowerCase();

    switch (unit) {
      case 'd':
        return amount * 86400;
      case 'h':
        return amount * 3600;
      case 'm':
        return amount * 60;
      case 's':
      default:
        return amount;
    }
  }
}
