import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
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
} from './auth.constants';
import type { AuthenticatedUser, AuthResponse } from './auth.types';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.register(registerDto);
    this.setAuthCookie(response, result.accessToken);

    return { user: result.user };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @ActiveUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.login(user);
    this.setAuthCookie(response, result.accessToken);

    return { user: result.user };
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

  private setAuthCookie(response: Response, token: string): void {
    response.cookie(
      ACCESS_TOKEN_COOKIE_NAME,
      token,
      ACCESS_TOKEN_COOKIE_OPTIONS,
    );
  }
}
