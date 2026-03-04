import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ActiveUser } from './decorators/active-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import type { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from './auth.constants';
import type { AuthenticatedUser, AuthResponse } from './auth.types';
import type { Request } from 'express';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.register(
      registerDto,
      this.extractSessionMetadata(request),
    );
    this.setAuthCookies(response, result.accessToken, result.refreshToken);

    return { user: result.user };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @ActiveUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.login(
      user,
      this.extractSessionMetadata(request),
    );
    this.setAuthCookies(response, result.accessToken, result.refreshToken);

    return { user: result.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const refreshToken =
      typeof request.cookies?.[REFRESH_TOKEN_COOKIE_NAME] === 'string'
        ? request.cookies[REFRESH_TOKEN_COOKIE_NAME]
        : undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const result = await this.authService.refreshSession(
      refreshToken,
      this.extractSessionMetadata(request),
    );

    this.setAuthCookies(response, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    const refreshToken =
      typeof request.cookies?.[REFRESH_TOKEN_COOKIE_NAME] === 'string'
        ? request.cookies[REFRESH_TOKEN_COOKIE_NAME]
        : undefined;
    await this.authService.revokeSessionByToken(refreshToken);
    this.clearAuthCookies(response);

    return { message: 'ok' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@ActiveUser() user: AuthenticatedUser | undefined): AuthResponse {
    return { user: user as AuthenticatedUser };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@ActiveUser() user: AuthenticatedUser | undefined) {
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/ping')
  adminPing(): { message: string } {
    return { message: 'pong' };
  }

  private setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    response.cookie(
      ACCESS_TOKEN_COOKIE_NAME,
      accessToken,
      ACCESS_TOKEN_COOKIE_OPTIONS,
    );
    response.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
  }

  private clearAuthCookies(response: Response): void {
    response.clearCookie(ACCESS_TOKEN_COOKIE_NAME, ACCESS_TOKEN_COOKIE_OPTIONS);
    response.clearCookie(
      REFRESH_TOKEN_COOKIE_NAME,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
  }

  private extractSessionMetadata(request: Request) {
    return {
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    };
  }
}
