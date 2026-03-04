import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';
import { TransactionsService } from '../transactions/transactions.service';
import {
  recurringInstances,
  recurringRules,
  type RecurringRule,
} from '../database/schema';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';
import type {
  RecurringInstanceResponse,
  RecurringRuleResponse,
} from './recurring.types';

@Injectable()
export class RecurringService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async listRules(userId: string): Promise<RecurringRuleResponse[]> {
    const rows = await this.drizzle.db
      .select()
      .from(recurringRules)
      .where(eq(recurringRules.userId, userId));

    return rows.map((row) => this.serializeRule(row));
  }

  async createRule(
    userId: string,
    dto: CreateRecurringDto,
  ): Promise<RecurringRuleResponse> {
    this.validateRule(dto);

    const interval = dto.interval ?? 1;
    const startDate = dto.startDate ?? new Date();
    const nextRunAt = this.computeNextRunAt(startDate, dto, interval);

    const createdRows = await this.drizzle.db
      .insert(recurringRules)
      .values({
        userId,
        name: dto.name,
        type: dto.type,
        frequency: dto.frequency,
        interval,
        dayOfWeek: dto.dayOfWeek ?? null,
        dayOfMonth: dto.dayOfMonth ?? null,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        kind: dto.kind,
        amount: String(dto.amount),
        accountId: dto.accountId ?? null,
        fromAccountId: dto.fromAccountId ?? null,
        toAccountId: dto.toAccountId ?? null,
        categoryId: dto.categoryId ?? null,
        description: dto.description ?? null,
        startDate,
        nextRunAt,
        status: 'active',
        updatedAt: new Date(),
      })
      .returning();

    const created = createdRows[0];

    if (!created) {
      throw new BadRequestException('Unable to create recurring rule');
    }

    return this.serializeRule(created);
  }

  async updateRule(
    userId: string,
    id: string,
    dto: UpdateRecurringDto,
  ): Promise<RecurringRuleResponse> {
    const existing = await this.getRule(userId, id);
    const merged = { ...existing, ...dto } as RecurringRule;

    this.validateRule(merged);

    const interval = dto.interval ?? existing.interval;
    const startDate = dto.startDate ?? existing.startDate;
    const nextRunAt = this.computeNextRunAt(startDate, merged, interval);

    const updatedRows = (await this.drizzle.db
      .update(recurringRules)
      .set({
        name: dto.name ?? existing.name,
        type: dto.type ?? existing.type,
        frequency: dto.frequency ?? existing.frequency,
        interval,
        dayOfWeek: dto.dayOfWeek ?? existing.dayOfWeek,
        dayOfMonth: dto.dayOfMonth ?? existing.dayOfMonth,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        kind: dto.kind ?? existing.kind,
        amount: dto.amount ? String(dto.amount) : existing.amount,
        accountId: dto.accountId ?? existing.accountId,
        fromAccountId: dto.fromAccountId ?? existing.fromAccountId,
        toAccountId: dto.toAccountId ?? existing.toAccountId,
        categoryId: dto.categoryId ?? existing.categoryId,
        description: dto.description ?? existing.description,
        startDate,
        nextRunAt,
        status: dto.status ?? existing.status,
        updatedAt: new Date(),
      })
      .where(and(eq(recurringRules.id, id), eq(recurringRules.userId, userId)))
      .returning()) as RecurringRule[];

    const updated = updatedRows[0];

    if (!updated) {
      throw new NotFoundException('Recurring rule not found');
    }

    return this.serializeRule(updated);
  }

  async runRule(
    userId: string,
    id: string,
  ): Promise<RecurringInstanceResponse> {
    const rule = await this.getRule(userId, id);

    if (rule.status !== 'active') {
      throw new BadRequestException('Recurring rule is paused');
    }

    const dueDate = rule.nextRunAt;

    return this.drizzle.db.transaction(async (tx) => {
      const [instance] = await tx
        .insert(recurringInstances)
        .values({
          ruleId: rule.id,
          dueDate,
          status: rule.type === 'manual_due' ? 'due' : 'posted',
          updatedAt: new Date(),
        })
        .returning();

      if (!instance) {
        throw new BadRequestException('Unable to create recurring instance');
      }

      let transactionId: string | null = null;

      if (rule.type === 'auto_post') {
        const transaction = await this.transactionsService.createTransaction(
          userId,
          {
            kind: rule.kind,
            amount: Number(rule.amount),
            accountId: rule.accountId ?? undefined,
            fromAccountId: rule.fromAccountId ?? undefined,
            toAccountId: rule.toAccountId ?? undefined,
            categoryId: rule.categoryId ?? undefined,
            description: rule.description ?? undefined,
            occurredAt: dueDate,
          },
        );

        transactionId = transaction.id;
        await tx
          .update(recurringInstances)
          .set({
            transactionId: transaction.id,
            status: 'posted',
            updatedAt: new Date(),
          })
          .where(eq(recurringInstances.id, instance.id));
      }

      const nextRunAt = this.computeNextRunAt(dueDate, rule, rule.interval);

      await tx
        .update(recurringRules)
        .set({
          lastRunAt: dueDate,
          nextRunAt,
          updatedAt: new Date(),
        })
        .where(eq(recurringRules.id, rule.id));

      return this.serializeInstance({
        ...instance,
        status: rule.type === 'auto_post' ? 'posted' : 'due',
        transactionId,
      });
    });
  }

  async markPaid(
    userId: string,
    id: string,
  ): Promise<RecurringInstanceResponse> {
    const rule = await this.getRule(userId, id);

    if (rule.type !== 'manual_due') {
      throw new BadRequestException('Only manual due items can be marked paid');
    }

    const dueDate = rule.nextRunAt;

    return this.drizzle.db.transaction(async (tx) => {
      const [instance] = await tx
        .insert(recurringInstances)
        .values({
          ruleId: rule.id,
          dueDate,
          status: 'posted',
          updatedAt: new Date(),
        })
        .returning();

      if (!instance) {
        throw new BadRequestException('Unable to create recurring instance');
      }

      const transaction = await this.transactionsService.createTransaction(
        userId,
        {
          kind: rule.kind,
          amount: Number(rule.amount),
          accountId: rule.accountId ?? undefined,
          fromAccountId: rule.fromAccountId ?? undefined,
          toAccountId: rule.toAccountId ?? undefined,
          categoryId: rule.categoryId ?? undefined,
          description: rule.description ?? undefined,
          occurredAt: dueDate,
        },
      );

      await tx
        .update(recurringInstances)
        .set({
          transactionId: transaction.id,
          status: 'posted',
          updatedAt: new Date(),
        })
        .where(eq(recurringInstances.id, instance.id));

      const nextRunAt = this.computeNextRunAt(dueDate, rule, rule.interval);

      await tx
        .update(recurringRules)
        .set({
          lastRunAt: dueDate,
          nextRunAt,
          updatedAt: new Date(),
        })
        .where(eq(recurringRules.id, rule.id));

      return this.serializeInstance({
        ...instance,
        status: 'posted',
        transactionId: transaction.id,
      });
    });
  }

  private async getRule(userId: string, id: string): Promise<RecurringRule> {
    const [rule] = await this.drizzle.db
      .select()
      .from(recurringRules)
      .where(and(eq(recurringRules.id, id), eq(recurringRules.userId, userId)));

    if (!rule) {
      throw new NotFoundException('Recurring rule not found');
    }

    return rule;
  }

  private validateRule(rule: CreateRecurringDto | RecurringRule) {
    if (rule.kind === 'transfer') {
      if (!rule.fromAccountId || !rule.toAccountId) {
        throw new BadRequestException('Transfer accounts are required');
      }
    } else if (!rule.accountId) {
      throw new BadRequestException('Account is required');
    }

    if (rule.frequency === 'weekly' && rule.dayOfWeek == null) {
      throw new BadRequestException('Day of week is required for weekly rules');
    }

    if (rule.frequency === 'monthly' && rule.dayOfMonth == null) {
      throw new BadRequestException(
        'Day of month is required for monthly rules',
      );
    }
  }

  private computeNextRunAt(
    from: Date,
    rule: {
      frequency: RecurringRule['frequency'];
      dayOfWeek?: number | null;
      dayOfMonth?: number | null;
    },
    interval: number,
  ): Date {
    if (rule.frequency === 'daily') {
      return this.addDays(from, interval);
    }

    if (rule.frequency === 'weekly') {
      return this.nextWeekly(from, rule.dayOfWeek ?? 0, interval);
    }

    return this.nextMonthly(from, rule.dayOfMonth ?? 1, interval);
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  private nextWeekly(base: Date, dayOfWeek: number, interval: number): Date {
    const current = new Date(base);
    const currentDay = current.getDay();
    let delta = (dayOfWeek - currentDay + 7) % 7;
    if (delta === 0) {
      delta = 7;
    }

    delta += 7 * (interval - 1);
    return this.addDays(current, delta);
  }

  private nextMonthly(base: Date, dayOfMonth: number, interval: number): Date {
    const year = base.getFullYear();
    const month = base.getMonth();
    const candidate = this.safeDate(year, month, dayOfMonth);

    if (candidate > base) {
      return candidate;
    }

    return this.safeDate(year, month + interval, dayOfMonth);
  }

  private safeDate(year: number, month: number, day: number): Date {
    const date = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    date.setDate(Math.min(day, lastDay));
    return date;
  }

  private serializeRule(rule: RecurringRule): RecurringRuleResponse {
    return {
      id: rule.id,
      userId: rule.userId,
      name: rule.name,
      type: rule.type,
      frequency: rule.frequency,
      interval: rule.interval,
      dayOfWeek: rule.dayOfWeek,
      dayOfMonth: rule.dayOfMonth,
      kind: rule.kind,
      amount: Number(rule.amount),
      accountId: rule.accountId,
      fromAccountId: rule.fromAccountId,
      toAccountId: rule.toAccountId,
      categoryId: rule.categoryId,
      description: rule.description,
      startDate: rule.startDate.toISOString(),
      nextRunAt: rule.nextRunAt.toISOString(),
      lastRunAt: rule.lastRunAt ? rule.lastRunAt.toISOString() : null,
      status: rule.status,
    };
  }

  private serializeInstance(instance: {
    id: string;
    ruleId: string;
    dueDate: Date;
    status: 'due' | 'posted' | 'skipped';
    transactionId?: string | null;
  }): RecurringInstanceResponse {
    return {
      id: instance.id,
      ruleId: instance.ruleId,
      dueDate: instance.dueDate.toISOString(),
      status: instance.status,
      transactionId: instance.transactionId ?? null,
    };
  }
}
