import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import type { AccountResponse } from './accounts.types';

@UseGuards(JwtAuthGuard)
@Controller({ path: 'accounts', version: '1' })
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  list(@ActiveUser() user: AuthenticatedUser): Promise<AccountResponse[]> {
    return this.accountsService.listAccounts(user.id);
  }

  @Post()
  create(
    @ActiveUser() user: AuthenticatedUser,
    @Body() dto: CreateAccountDto,
  ): Promise<AccountResponse> {
    return this.accountsService.createAccount(user.id, dto);
  }

  @Get(':id')
  get(
    @ActiveUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<AccountResponse> {
    return this.accountsService.getAccount(user.id, id);
  }
}
