import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_TOKEN_COOKIE_NAME, jwtConfig } from '../auth.constants';
import { AuthService } from '../auth.service';
import type { AuthenticatedUser, JwtPayload } from '../auth.types';

interface RequestWithCookies extends Request {
  cookies: {
    [key: string]: string; // or be stricter if you know your cookie names
  };
}

function extractTokenFromCookie(request: RequestWithCookies): string | null {
  return request.cookies?.[ACCESS_TOKEN_COOKIE_NAME] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractTokenFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    return this.authService.validateUserById(payload.sub);
  }
}
