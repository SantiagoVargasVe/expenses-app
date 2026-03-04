import { Module } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';
import { CreditCardsController } from './credit-cards.controller';

@Module({
  imports: [TransactionsModule],
  controllers: [CreditCardsController],
})
export class CreditCardsModule {}
