import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';
import type { TransactionResponse } from './transactions.types';

@UseGuards(JwtAuthGuard)
@Controller({ path: 'transactions', version: '1' })
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  list(
    @ActiveUser() user: AuthenticatedUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('accountId') accountId?: string,
    @Query('kind') kind?: string,
    @Query('categoryId') categoryId?: string,
  ): Promise<TransactionResponse[]> {
    return this.transactionsService.listTransactions(user.id, {
      from,
      to,
      accountId,
      kind,
      categoryId,
    });
  }

  @Post()
  create(
    @ActiveUser() user: AuthenticatedUser,
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionResponse> {
    return this.transactionsService.createTransaction(user.id, dto);
  }

  @Patch(':id')
  update(
    @ActiveUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<TransactionResponse> {
    return this.transactionsService.updateTransaction(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @ActiveUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.transactionsService.deleteTransaction(user.id, id);
  }
}
