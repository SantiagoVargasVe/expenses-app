import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateDebtDto } from './dto/create-debt.dto';
import { SettleDebtDto } from './dto/settle-debt.dto';
import { DebtsService } from './debts.service';
import type { DebtEventResponse, DebtResponse } from './debts.types';

@UseGuards(JwtAuthGuard)
@Controller({ path: 'debts', version: '1' })
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Get()
  list(@ActiveUser() user: AuthenticatedUser): Promise<DebtResponse[]> {
    return this.debtsService.listDebts(user.id);
  }

  @Post()
  create(
    @ActiveUser() user: AuthenticatedUser,
    @Body() dto: CreateDebtDto,
  ): Promise<DebtResponse> {
    return this.debtsService.createDebt(user.id, dto);
  }

  @Post(':id/settle')
  settle(
    @ActiveUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: SettleDebtDto,
  ): Promise<DebtEventResponse> {
    return this.debtsService.settleDebt(user.id, id, dto);
  }

  @Get(':id/history')
  history(
    @ActiveUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<DebtEventResponse[]> {
    return this.debtsService.listHistory(user.id, id);
  }
}
