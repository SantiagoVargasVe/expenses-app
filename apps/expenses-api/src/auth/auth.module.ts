import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TokenService } from './token.service';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ session: false }),
    UsersModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    LocalAuthGuard,
    JwtAuthGuard,
    TokenService,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, TokenService],
})
export class AuthModule {}
