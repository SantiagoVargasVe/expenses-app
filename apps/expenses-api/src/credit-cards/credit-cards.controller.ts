import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { TransactionsService } from '../transactions/transactions.service';
import type { CreditCardStatementResponse } from '../transactions/transactions.types';

@UseGuards(JwtAuthGuard)
@Controller({ path: 'credit-cards', version: '1' })
export class CreditCardsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get(':accountId/statement')
  getStatement(
    @ActiveUser() user: AuthenticatedUser,
    @Param('accountId') accountId: string,
    @Query('asOf') asOf?: string,
  ): Promise<CreditCardStatementResponse> {
    return this.transactionsService.getStatement(user.id, accountId, asOf);
  }

  @Get(':accountId/installments')
  listInstallments(
    @ActiveUser() user: AuthenticatedUser,
    @Param('accountId') accountId: string,
  ) {
    return this.transactionsService.listInstallmentPlans(user.id, accountId);
  }

  @Post('installments/:planId/prepay')
  prepay(
    @ActiveUser() user: AuthenticatedUser,
    @Param('planId') planId: string,
  ) {
    return this.transactionsService.prepayInstallments(user.id, planId);
  }

  @Post('installments/:planId/cancel')
  cancel(
    @ActiveUser() user: AuthenticatedUser,
    @Param('planId') planId: string,
  ) {
    return this.transactionsService.cancelInstallments(user.id, planId);
  }
}
