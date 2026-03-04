import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  eq,
  gte,
  inArray,
  isNull,
  lte,
  notInArray,
  or,
} from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  accounts,
  creditCardInstallmentItems,
  creditCardInstallmentPlans,
  creditCardProfiles,
  transactions,
  type Account,
  type CreditCardProfile,
  type Transaction,
  type TransactionKind,
} from '../database/schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import type {
  CreditCardStatementResponse,
  StatementItem,
  TransactionResponse,
} from './transactions.types';

interface TransactionFilters {
  from?: string;
  to?: string;
  accountId?: string;
  kind?: string;
  categoryId?: string;
}

interface AccountContext {
  account: Account;
  creditCard?: CreditCardProfile | null;
}

@Injectable()
export class TransactionsService {
  constructor(private readonly drizzle: DrizzleService) {}

  async listTransactions(
    userId: string,
    filters: TransactionFilters,
  ): Promise<TransactionResponse[]> {
    const conditions = [
      eq(transactions.userId, userId),
      isNull(transactions.deletedAt),
    ];

    if (filters.kind) {
      conditions.push(eq(transactions.kind, filters.kind as TransactionKind));
    }

    if (filters.categoryId) {
      conditions.push(eq(transactions.categoryId, filters.categoryId));
    }

    if (filters.from) {
      const fromDate = new Date(filters.from);
      if (!Number.isNaN(fromDate.getTime())) {
        conditions.push(gte(transactions.occurredAt, fromDate));
      }
    }

    if (filters.to) {
      const toDate = new Date(filters.to);
      if (!Number.isNaN(toDate.getTime())) {
        conditions.push(lte(transactions.occurredAt, toDate));
      }
    }

    if (filters.accountId) {
      const accountCondition = or(
        eq(transactions.accountId, filters.accountId),
        eq(transactions.fromAccountId, filters.accountId),
        eq(transactions.toAccountId, filters.accountId),
      );
      if (accountCondition) {
        conditions.push(accountCondition);
      }
    }

    const rows = await this.drizzle.db
      .select()
      .from(transactions)
      .where(and(...conditions));

    return rows.map((row) => this.serializeTransaction(row));
  }

  async createTransaction(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<TransactionResponse> {
    const payload = this.normalizeCreatePayload(dto);
    const { accountIds } = this.collectAccountIds(payload);

    return this.drizzle.db.transaction(async (tx) => {
      const accountsContext = await this.loadAccounts(tx, userId, accountIds);
      this.assertAccountsPresent(accountsContext, accountIds);

      const createdRows = await tx
        .insert(transactions)
        .values({
          userId,
          kind: payload.kind,
          amount: String(payload.amount),
          accountId: payload.accountId ?? null,
          fromAccountId: payload.fromAccountId ?? null,
          toAccountId: payload.toAccountId ?? null,
          categoryId: payload.categoryId ?? null,
          description: payload.description ?? null,
          occurredAt: payload.occurredAt,
          updatedAt: new Date(),
        })
        .returning();

      const created = Array.isArray(createdRows)
        ? createdRows[0]
        : createdRows.rows?.[0];

      if (!created) {
        throw new BadRequestException('Unable to create transaction');
      }

      await this.applyBalanceChanges(tx, accountsContext, payload, 1);

      let installmentPlanId: string | null = null;

      if (payload.installmentsTotal && payload.installmentsTotal > 1) {
        const accountId = payload.accountId;
        if (!accountId) {
          throw new BadRequestException('Installments require accountId');
        }

        const context = accountsContext[accountId];
        if (!context || context.account.type !== 'credit_card') {
          throw new BadRequestException(
            'Installments require credit card account',
          );
        }

        installmentPlanId = await this.createInstallmentPlan(
          tx,
          context,
          created,
          payload.installmentsTotal,
        );
      }

      return this.serializeTransaction(created, installmentPlanId);
    });
  }

  async updateTransaction(
    userId: string,
    transactionId: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionResponse> {
    const original = await this.findTransaction(userId, transactionId);

    if (original.reversedAt) {
      throw new BadRequestException('Transaction already reversed');
    }

    const hasInstallments = await this.hasInstallmentPlan(original.id);
    if (hasInstallments) {
      throw new BadRequestException(
        'Installment transactions cannot be edited',
      );
    }

    const merged = this.mergeUpdatePayload(original, dto);
    const payload = this.normalizeCreatePayload(merged);
    const { accountIds } = this.collectAccountIds(payload, original);

    return this.drizzle.db.transaction(async (tx) => {
      const accountsContext = await this.loadAccounts(tx, userId, accountIds);
      this.assertAccountsPresent(accountsContext, accountIds);

      await this.applyBalanceChanges(tx, accountsContext, original, -1);

      const reversalRows = await tx
        .insert(transactions)
        .values({
          userId,
          kind: original.kind,
          amount: String(original.amount),
          accountId: original.accountId ?? null,
          fromAccountId: original.fromAccountId ?? null,
          toAccountId: original.toAccountId ?? null,
          categoryId: original.categoryId ?? null,
          description: `Reversal of ${original.id}`,
          occurredAt: new Date(),
          updatedAt: new Date(),
          isReversal: true,
          reversalOfId: original.id,
        })
        .returning();

      const reversal = Array.isArray(reversalRows)
        ? reversalRows[0]
        : reversalRows.rows?.[0];

      if (!reversal) {
        throw new BadRequestException('Unable to reverse transaction');
      }

      await tx
        .update(transactions)
        .set({ reversedAt: new Date(), updatedAt: new Date() })
        .where(eq(transactions.id, original.id));

      const updatedRows = await tx
        .insert(transactions)
        .values({
          userId,
          kind: payload.kind,
          amount: String(payload.amount),
          accountId: payload.accountId ?? null,
          fromAccountId: payload.fromAccountId ?? null,
          toAccountId: payload.toAccountId ?? null,
          categoryId: payload.categoryId ?? null,
          description: payload.description ?? null,
          occurredAt: payload.occurredAt,
          updatedAt: new Date(),
        })
        .returning();

      const updated = Array.isArray(updatedRows)
        ? updatedRows[0]
        : updatedRows.rows?.[0];

      if (!updated) {
        throw new BadRequestException('Unable to update transaction');
      }

      await this.applyBalanceChanges(tx, accountsContext, payload, 1);

      return this.serializeTransaction(updated);
    });
  }

  async deleteTransaction(
    userId: string,
    transactionId: string,
  ): Promise<{ message: string }> {
    const original = await this.findTransaction(userId, transactionId);

    if (original.deletedAt) {
      return { message: 'ok' };
    }

    const hasInstallments = await this.hasInstallmentPlan(original.id);
    if (hasInstallments) {
      throw new BadRequestException(
        'Installment transactions cannot be deleted',
      );
    }

    return this.drizzle.db.transaction(async (tx) => {
      const { accountIds } = this.collectAccountIds(original);
      const accountsContext = await this.loadAccounts(tx, userId, accountIds);
      this.assertAccountsPresent(accountsContext, accountIds);

      await this.applyBalanceChanges(tx, accountsContext, original, -1);

      await tx
        .update(transactions)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(transactions.id, original.id));

      await tx
        .insert(transactions)
        .values({
          userId,
          kind: original.kind,
          amount: String(original.amount),
          accountId: original.accountId ?? null,
          fromAccountId: original.fromAccountId ?? null,
          toAccountId: original.toAccountId ?? null,
          categoryId: original.categoryId ?? null,
          description: `Reversal of ${original.id}`,
          occurredAt: new Date(),
          updatedAt: new Date(),
          isReversal: true,
          reversalOfId: original.id,
        })
        .returning();

      return { message: 'ok' };
    });
  }

  async listInstallmentPlans(
    userId: string,
    accountId: string,
  ): Promise<
    Array<{
      id: string;
      transactionId: string;
      totalAmount: number;
      installmentsTotal: number;
      installmentsRemaining: number;
      status: string;
      items: Array<{
        id: string;
        installmentNumber: number;
        dueDate: string;
        amount: number;
        status: string;
      }>;
    }>
  > {
    const account = await this.ensureAccount(userId, accountId);

    if (account.type !== 'credit_card') {
      throw new BadRequestException('Account is not a credit card');
    }

    const plans = await this.drizzle.db
      .select()
      .from(creditCardInstallmentPlans)
      .where(eq(creditCardInstallmentPlans.accountId, accountId));

    if (plans.length === 0) {
      return [];
    }

    const planIds = plans.map((plan) => plan.id);
    const items = await this.drizzle.db
      .select()
      .from(creditCardInstallmentItems)
      .where(inArray(creditCardInstallmentItems.planId, planIds));

    return plans.map((plan) => ({
      id: plan.id,
      transactionId: plan.transactionId,
      totalAmount: Number(plan.totalAmount),
      installmentsTotal: plan.installmentsTotal,
      installmentsRemaining: plan.installmentsRemaining,
      status: plan.status,
      items: items
        .filter((item) => item.planId === plan.id)
        .map((item) => ({
          id: item.id,
          installmentNumber: item.installmentNumber,
          dueDate: item.dueDate.toISOString(),
          amount: Number(item.amount),
          status: item.status,
        })),
    }));
  }

  async getStatement(
    userId: string,
    accountId: string,
    asOf?: string,
  ): Promise<CreditCardStatementResponse> {
    const account = await this.ensureAccount(userId, accountId);

    if (account.type !== 'credit_card') {
      throw new BadRequestException('Account is not a credit card');
    }

    const profile = await this.ensureCreditCardProfile(accountId);
    const asOfDate = asOf ? new Date(asOf) : new Date();
    const period = this.computeStatementPeriod(
      asOfDate,
      profile.statementCutoffDay,
      profile.statementDueDay,
    );

    const installmentItems = await this.drizzle.db
      .select({
        item: creditCardInstallmentItems,
        plan: creditCardInstallmentPlans,
      })
      .from(creditCardInstallmentItems)
      .innerJoin(
        creditCardInstallmentPlans,
        eq(creditCardInstallmentItems.planId, creditCardInstallmentPlans.id),
      )
      .where(
        and(
          eq(creditCardInstallmentPlans.accountId, accountId),
          gte(creditCardInstallmentItems.dueDate, period.start),
          lte(creditCardInstallmentItems.dueDate, period.end),
          eq(creditCardInstallmentItems.status, 'open'),
        ),
      );

    const planTransactionIds = await this.drizzle.db
      .select({ transactionId: creditCardInstallmentPlans.transactionId })
      .from(creditCardInstallmentPlans)
      .where(eq(creditCardInstallmentPlans.accountId, accountId));

    const excludedIds = planTransactionIds.map((row) => row.transactionId);

    const purchaseConditions = [
      eq(transactions.userId, userId),
      eq(transactions.accountId, accountId),
      eq(transactions.kind, 'expense'),
      isNull(transactions.deletedAt),
      isNull(transactions.reversedAt),
      eq(transactions.isReversal, false),
      gte(transactions.occurredAt, period.start),
      lte(transactions.occurredAt, period.end),
    ];

    if (excludedIds.length) {
      purchaseConditions.push(notInArray(transactions.id, excludedIds));
    }

    const purchaseRows = await this.drizzle.db
      .select()
      .from(transactions)
      .where(and(...purchaseConditions));

    const installmentItemsMapped: StatementItem[] = installmentItems.map(
      ({ item, plan }) => ({
        id: item.id,
        type: 'installment',
        amount: Number(item.amount),
        occurredAt: item.dueDate.toISOString(),
        description: `Installment ${item.installmentNumber} of ${plan.installmentsTotal}`,
      }),
    );

    const purchaseItems: StatementItem[] = purchaseRows.map((row) => ({
      id: row.id,
      type: 'purchase',
      amount: Number(row.amount),
      occurredAt: row.occurredAt.toISOString(),
      description: row.description,
    }));

    const totalDue = [...installmentItemsMapped, ...purchaseItems].reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    return {
      periodStart: period.start.toISOString(),
      periodEnd: period.end.toISOString(),
      dueDate: period.dueDate.toISOString(),
      totalDue,
      items: [...installmentItemsMapped, ...purchaseItems],
    };
  }

  async prepayInstallments(
    userId: string,
    planId: string,
  ): Promise<{ message: string }> {
    return this.adjustInstallments(userId, planId, 'prepaid');
  }

  async cancelInstallments(
    userId: string,
    planId: string,
  ): Promise<{ message: string }> {
    return this.adjustInstallments(userId, planId, 'canceled');
  }

  private normalizeCreatePayload(dto: CreateTransactionDto) {
    if (dto.kind === 'transfer') {
      if (!dto.fromAccountId || !dto.toAccountId) {
        throw new BadRequestException('Transfer accounts are required');
      }
      if (dto.fromAccountId === dto.toAccountId) {
        throw new BadRequestException('Transfer accounts must be different');
      }
    }

    if (dto.kind !== 'transfer' && !dto.accountId) {
      throw new BadRequestException('Account is required');
    }

    if (dto.installmentsTotal && dto.installmentsTotal > 1) {
      if (dto.kind !== 'expense') {
        throw new BadRequestException('Installments only apply to expenses');
      }
    }

    return {
      ...dto,
      occurredAt: dto.occurredAt ?? new Date(),
    };
  }

  private mergeUpdatePayload(
    original: Transaction,
    dto: UpdateTransactionDto,
  ): CreateTransactionDto {
    return {
      kind: dto.kind ?? original.kind,
      amount: dto.amount ?? Number(original.amount),
      accountId: dto.accountId ?? original.accountId ?? undefined,
      fromAccountId: dto.fromAccountId ?? original.fromAccountId ?? undefined,
      toAccountId: dto.toAccountId ?? original.toAccountId ?? undefined,
      categoryId: dto.categoryId ?? original.categoryId ?? undefined,
      description: dto.description ?? original.description ?? undefined,
      occurredAt: dto.occurredAt ?? original.occurredAt,
    };
  }

  private collectAccountIds(
    payload: Partial<Transaction>,
    original?: Transaction,
  ) {
    const ids = new Set<string>();
    const accountId =
      (payload as CreateTransactionDto).accountId ?? original?.accountId;
    const fromAccountId =
      (payload as CreateTransactionDto).fromAccountId ??
      original?.fromAccountId;
    const toAccountId =
      (payload as CreateTransactionDto).toAccountId ?? original?.toAccountId;

    if (accountId) ids.add(accountId);
    if (fromAccountId) ids.add(fromAccountId);
    if (toAccountId) ids.add(toAccountId);

    return { accountIds: Array.from(ids) };
  }

  private async loadAccounts(
    tx: typeof this.drizzle.db,
    userId: string,
    accountIds: string[],
  ): Promise<Record<string, AccountContext>> {
    if (accountIds.length === 0) {
      return {};
    }

    const accountRows = await tx
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.userId, userId), inArray(accounts.id, accountIds)),
      );

    const accountMap: Record<string, AccountContext> = {};
    accountRows.forEach((account) => {
      accountMap[account.id] = { account };
    });

    const creditCardRows = await tx
      .select()
      .from(creditCardProfiles)
      .where(inArray(creditCardProfiles.accountId, accountIds));

    creditCardRows.forEach((profile) => {
      if (accountMap[profile.accountId]) {
        accountMap[profile.accountId].creditCard = profile;
      }
    });

    return accountMap;
  }

  private assertAccountsPresent(
    accountsContext: Record<string, AccountContext>,
    accountIds: string[],
  ) {
    const missing = accountIds.filter((id) => !accountsContext[id]);
    if (missing.length) {
      throw new NotFoundException('Account not found');
    }
  }

  private async applyBalanceChanges(
    tx: typeof this.drizzle.db,
    accountsContext: Record<string, AccountContext>,
    payload: Partial<Transaction>,
    direction: 1 | -1,
  ) {
    const kind = payload.kind;
    const amount = Number(payload.amount) * direction;

    if (kind === 'transfer') {
      const fromAccountId = payload.fromAccountId as string;
      const toAccountId = payload.toAccountId as string;
      const fromContext = accountsContext[fromAccountId];
      const toContext = accountsContext[toAccountId];

      await this.updateAccountBalance(tx, fromContext, -amount);
      await this.updateAccountBalance(tx, toContext, amount);

      return;
    }

    const accountId = payload.accountId as string;
    const context = accountsContext[accountId];

    if (kind === 'income') {
      await this.updateAccountBalance(tx, context, amount, 'income');
      return;
    }

    if (kind === 'expense') {
      await this.updateAccountBalance(tx, context, -amount, 'expense');
    }
  }

  private async createInstallmentPlan(
    tx: typeof this.drizzle.db,
    context: AccountContext,
    transaction: Transaction,
    installmentsTotal: number,
  ): Promise<string> {
    const creditCard = context.creditCard;

    if (!creditCard) {
      throw new BadRequestException('Missing credit card profile');
    }

    const totalAmount = Number(transaction.amount);
    const planRows = await tx
      .insert(creditCardInstallmentPlans)
      .values({
        accountId: context.account.id,
        transactionId: transaction.id,
        totalAmount: String(totalAmount),
        installmentsTotal,
        installmentsRemaining: installmentsTotal,
        status: 'active',
        updatedAt: new Date(),
      })
      .returning();

    const plan = planRows[0];

    if (!plan) {
      throw new BadRequestException('Unable to create installment plan');
    }

    const dueDates = this.buildInstallmentSchedule(
      transaction.occurredAt,
      creditCard.statementDueDay,
      installmentsTotal,
    );
    const amounts = this.splitAmount(totalAmount, installmentsTotal);

    const itemsToInsert = dueDates.map((dueDate, index) => ({
      planId: plan.id,
      installmentNumber: index + 1,
      dueDate,
      amount: String(amounts[index]),
      status: 'open' as const,
      updatedAt: new Date(),
    }));

    await tx.insert(creditCardInstallmentItems).values(itemsToInsert);

    return plan.id;
  }

  private buildInstallmentSchedule(
    purchaseDate: Date,
    dueDay: number,
    installmentsTotal: number,
  ): Date[] {
    const firstDueDate = this.computeNextDueDate(purchaseDate, dueDay);
    return Array.from({ length: installmentsTotal }, (_, index) =>
      this.addMonths(firstDueDate, index),
    );
  }

  private computeNextDueDate(reference: Date, dueDay: number): Date {
    const year = reference.getFullYear();
    const month = reference.getMonth();
    const day = reference.getDate();

    const candidate = this.safeDate(year, month, dueDay);

    if (day <= candidate.getDate()) {
      return candidate;
    }

    return this.safeDate(year, month + 1, dueDay);
  }

  private safeDate(year: number, month: number, day: number): Date {
    const date = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    date.setDate(Math.min(day, lastDay));
    return date;
  }

  private addMonths(date: Date, months: number): Date {
    const next = new Date(date);
    const targetMonth = next.getMonth() + months;
    const targetYear = next.getFullYear() + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;
    const day = next.getDate();

    const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
    return new Date(targetYear, normalizedMonth, Math.min(day, lastDay));
  }

  private splitAmount(
    totalAmount: number,
    installmentsTotal: number,
  ): number[] {
    const totalCents = Math.round(totalAmount * 100);
    const base = Math.floor(totalCents / installmentsTotal);
    const remainder = totalCents % installmentsTotal;

    return Array.from({ length: installmentsTotal }, (_, index) => {
      const cents = base + (index < remainder ? 1 : 0);
      return cents / 100;
    });
  }

  private async hasInstallmentPlan(transactionId: string): Promise<boolean> {
    const existing = await this.drizzle.db
      .select({ id: creditCardInstallmentPlans.id })
      .from(creditCardInstallmentPlans)
      .where(eq(creditCardInstallmentPlans.transactionId, transactionId));

    return existing.length > 0;
  }

  private async ensureAccount(userId: string, accountId: string) {
    const [account] = await this.drizzle.db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.id, accountId)));

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  private async ensureCreditCardProfile(accountId: string) {
    const [profile] = await this.drizzle.db
      .select()
      .from(creditCardProfiles)
      .where(eq(creditCardProfiles.accountId, accountId));

    if (!profile) {
      throw new NotFoundException('Credit card profile not found');
    }

    return profile;
  }

  private computeStatementPeriod(
    asOf: Date,
    cutoffDay: number,
    dueDay: number,
  ) {
    const currentCutoff = this.safeDate(
      asOf.getFullYear(),
      asOf.getMonth(),
      cutoffDay,
    );

    const periodEnd =
      asOf >= currentCutoff
        ? currentCutoff
        : this.safeDate(asOf.getFullYear(), asOf.getMonth() - 1, cutoffDay);

    const previousCutoff = this.safeDate(
      periodEnd.getFullYear(),
      periodEnd.getMonth() - 1,
      cutoffDay,
    );

    const periodStart = this.addDays(previousCutoff, 1);

    const dueDate = this.safeDate(
      periodEnd.getFullYear(),
      periodEnd.getMonth() + 1,
      dueDay,
    );

    return { start: periodStart, end: periodEnd, dueDate };
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  private async adjustInstallments(
    userId: string,
    planId: string,
    status: 'prepaid' | 'canceled',
  ): Promise<{ message: string }> {
    return this.drizzle.db.transaction(async (tx) => {
      const [plan] = await tx
        .select()
        .from(creditCardInstallmentPlans)
        .where(eq(creditCardInstallmentPlans.id, planId));

      if (!plan) {
        throw new NotFoundException('Installment plan not found');
      }

      const account = await this.ensureAccount(userId, plan.accountId);

      if (plan.status !== 'active') {
        return { message: 'ok' };
      }

      const items = await tx
        .select()
        .from(creditCardInstallmentItems)
        .where(eq(creditCardInstallmentItems.planId, plan.id));

      const openItems = items.filter((item) => item.status === 'open');
      const remainingAmount = openItems.reduce(
        (sum, item) => sum + Number(item.amount),
        0,
      );

      await tx
        .update(creditCardInstallmentItems)
        .set({
          status: status === 'prepaid' ? 'paid' : 'canceled',
          paidAt: status === 'prepaid' ? new Date() : null,
          canceledAt: status === 'canceled' ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(creditCardInstallmentItems.planId, plan.id));

      await tx
        .update(creditCardInstallmentPlans)
        .set({
          status,
          installmentsRemaining: 0,
          updatedAt: new Date(),
        })
        .where(eq(creditCardInstallmentPlans.id, plan.id));

      if (remainingAmount > 0) {
        const accountsContext = await this.loadAccounts(tx, userId, [
          account.id,
        ]);

        const createdRows = await tx
          .insert(transactions)
          .values({
            userId,
            kind: 'income',
            amount: String(remainingAmount),
            accountId: account.id,
            description:
              status === 'prepaid'
                ? `Prepay installments ${plan.id}`
                : `Cancel installments ${plan.id}`,
            occurredAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        const created = Array.isArray(createdRows)
          ? createdRows[0]
          : createdRows.rows?.[0];

        if (!created) {
          throw new BadRequestException('Unable to create adjustment');
        }

        await this.applyBalanceChanges(tx, accountsContext, created, 1);
      }

      return { message: 'ok' };
    });
  }
  private async updateAccountBalance(
    tx: typeof this.drizzle.db,
    context: AccountContext,
    delta: number,
    kind?: TransactionKind,
  ) {
    const nextBalance = Number(context.account.balance) + delta;
    await tx
      .update(accounts)
      .set({
        balance: String(nextBalance),
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, context.account.id));

    if (context.account.type !== 'credit_card') {
      return;
    }

    const profile = context.creditCard;

    if (!profile) {
      throw new BadRequestException('Missing credit card profile');
    }

    let availableDelta = 0;

    if (kind === 'expense') {
      availableDelta = -Math.abs(delta);
    } else if (kind === 'income') {
      availableDelta = Math.abs(delta);
    } else if (delta > 0) {
      availableDelta = Math.abs(delta);
    } else if (delta < 0) {
      availableDelta = -Math.abs(delta);
    }

    const creditLimit = Number(profile.creditLimit);
    const nextAvailable = Math.min(
      creditLimit,
      Math.max(0, Number(profile.availableCredit) + availableDelta),
    );

    await tx
      .update(creditCardProfiles)
      .set({
        availableCredit: String(nextAvailable),
        updatedAt: new Date(),
      })
      .where(eq(creditCardProfiles.accountId, context.account.id));
  }

  private async findTransaction(userId: string, transactionId: string) {
    const [row] = await this.drizzle.db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.id, transactionId),
        ),
      );

    if (!row) {
      throw new NotFoundException('Transaction not found');
    }

    return row;
  }

  private serializeTransaction(
    row: Transaction,
    installmentPlanId: string | null = null,
  ): TransactionResponse {
    return {
      id: row.id,
      userId: row.userId,
      kind: row.kind,
      amount: Number(row.amount),
      accountId: row.accountId,
      fromAccountId: row.fromAccountId,
      toAccountId: row.toAccountId,
      categoryId: row.categoryId,
      description: row.description,
      occurredAt: row.occurredAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
      reversedAt: row.reversedAt ? row.reversedAt.toISOString() : null,
      reversalOfId: row.reversalOfId ?? null,
      isReversal: row.isReversal,
      installmentPlanId,
    };
  }
}
