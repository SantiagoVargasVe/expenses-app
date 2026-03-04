import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';
import {
  accounts,
  creditCardProfiles,
  type Account,
  type CreditCardProfile,
} from '../database/schema';
import { CreateAccountDto } from './dto/create-account.dto';
import type {
  AccountResponse,
  CreditCardProfileResponse,
} from './accounts.types';

@Injectable()
export class AccountsService {
  constructor(private readonly drizzle: DrizzleService) {}

  async listAccounts(userId: string): Promise<AccountResponse[]> {
    const accountRows = await this.drizzle.db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));

    if (accountRows.length === 0) {
      return [];
    }

    const accountIds = accountRows.map((account) => account.id);
    const creditCardRows = await this.drizzle.db
      .select()
      .from(creditCardProfiles)
      .where(inArray(creditCardProfiles.accountId, accountIds));

    const creditCardMap = new Map<string, CreditCardProfileResponse>();
    creditCardRows.forEach((profile) => {
      creditCardMap.set(profile.accountId, this.serializeCreditCard(profile));
    });

    return accountRows.map((account) =>
      this.serializeAccount(account, creditCardMap.get(account.id) ?? null),
    );
  }

  async getAccount(
    userId: string,
    accountId: string,
  ): Promise<AccountResponse> {
    const [account] = await this.drizzle.db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    let creditCard: CreditCardProfileResponse | null = null;

    if (account.type === 'credit_card') {
      const [profile] = await this.drizzle.db
        .select()
        .from(creditCardProfiles)
        .where(eq(creditCardProfiles.accountId, account.id));

      creditCard = profile ? this.serializeCreditCard(profile) : null;
    }

    return this.serializeAccount(account, creditCard);
  }

  async createAccount(
    userId: string,
    dto: CreateAccountDto,
  ): Promise<AccountResponse> {
    if (dto.type === 'credit_card') {
      const creditLimit = dto.creditLimit;
      const statementCutoffDay = dto.statementCutoffDay;
      const statementDueDay = dto.statementDueDay;

      if (
        creditLimit === undefined ||
        statementCutoffDay === undefined ||
        statementDueDay === undefined
      ) {
        throw new BadRequestException('Credit card details are required');
      }

      const currency = dto.currency ?? 'COP';

      return this.drizzle.db.transaction(async (tx) => {
        const [account] = await tx
          .insert(accounts)
          .values({
            userId,
            name: dto.name,
            type: dto.type,
            balance: '0',
            currency,
            updatedAt: new Date(),
          })
          .returning();

        if (!account) {
          throw new BadRequestException('Unable to create account');
        }

        const [profile] = await tx
          .insert(creditCardProfiles)
          .values({
            accountId: account.id,
            creditLimit: String(creditLimit),
            availableCredit: String(creditLimit),
            statementCutoffDay,
            statementDueDay,
            updatedAt: new Date(),
          })
          .returning();

        const creditCard = profile ? this.serializeCreditCard(profile) : null;

        return this.serializeAccount(account, creditCard);
      });
    }

    const currency = dto.currency ?? 'COP';
    return this.drizzle.db.transaction(async (tx) => {
      const [account] = await tx
        .insert(accounts)
        .values({
          userId,
          name: dto.name,
          type: dto.type,
          balance: '0',
          currency,
          updatedAt: new Date(),
        })
        .returning();

      if (!account) {
        throw new BadRequestException('Unable to create account');
      }

      return this.serializeAccount(account, null);
    });
  }

  private serializeAccount(
    account: Account,
    creditCard: CreditCardProfileResponse | null,
  ): AccountResponse {
    return {
      id: account.id,
      userId: account.userId,
      name: account.name,
      type: account.type,
      balance: Number(account.balance),
      currency: account.currency,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
      creditCard,
    };
  }

  private serializeCreditCard(
    profile: CreditCardProfile,
  ): CreditCardProfileResponse {
    return {
      creditLimit: Number(profile.creditLimit),
      availableCredit: Number(profile.availableCredit),
      statementCutoffDay: profile.statementCutoffDay,
      statementDueDay: profile.statementDueDay,
    };
  }
}
