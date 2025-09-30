import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { PublicUser } from '../../database/schemas/users.schema';
import { UsersService } from '../../users/users.service';
import { TokenService, TokenVerificationResult } from '../token.service';

interface AuthenticatedRequest extends Request {
  user?: PublicUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const payload = this.tokenService.verify(token);
    if (payload.status !== TokenVerificationResult.Valid) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = this.usersService.toPublicUser(user);
    return true;
  }

  private extractTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (typeof authHeader !== 'string') {
      return null;
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return null;
    }

    return token;
  }
}
