import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';

import { PublicUser, User } from '../database/schemas/users.schema';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() payload: RegisterAuthDto): Promise<PublicUser> {
    return this.authService.register(payload);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @Body() _credentials: LoginAuthDto,
    @Request() req: { user: User },
  ): Promise<{ user: PublicUser }> {
    return this.authService.login(req.user);
  }
}
