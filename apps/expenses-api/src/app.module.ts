import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { DrizzleService } from './database/drizzle.service';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { RecurringModule } from './recurring/recurring.module';
import { PeopleModule } from './people/people.module';
import { DebtsModule } from './debts/debts.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    AccountsModule,
    TransactionsModule,
    CreditCardsModule,
    RecurringModule,
    PeopleModule,
    DebtsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DrizzleService],
})
export class AppModule {}
