import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';
import {
  contacts,
  debtEvents,
  debtMemberships,
  debts,
  type Debt,
} from '../database/schema';
import { CreateDebtDto } from './dto/create-debt.dto';
import { SettleDebtDto } from './dto/settle-debt.dto';
import type { DebtEventResponse, DebtResponse } from './debts.types';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class DebtsService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async listDebts(userId: string): Promise<DebtResponse[]> {
    const rows = await this.drizzle.db
      .select()
      .from(debts)
      .where(eq(debts.ownerId, userId));

    return rows.map((row) => this.serializeDebt(row));
  }

  async createDebt(userId: string, dto: CreateDebtDto): Promise<DebtResponse> {
    const [contact] = await this.drizzle.db
      .select()
      .from(contacts)
      .where(and(eq(contacts.id, dto.contactId), eq(contacts.userId, userId)));

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    const currency = dto.currency ?? 'COP';

    return this.drizzle.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(debts)
        .values({
          ownerId: userId,
          contactId: dto.contactId,
          direction: dto.direction,
          totalAmount: String(dto.amount),
          remainingAmount: String(dto.amount),
          currency,
          description: dto.description ?? null,
          status: 'open',
          updatedAt: new Date(),
        })
        .returning();

      if (!created) {
        throw new BadRequestException('Unable to create debt');
      }

      await tx.insert(debtMemberships).values([
        {
          debtId: created.id,
          memberType: 'user',
          userId,
          contactId: null,
        },
        {
          debtId: created.id,
          memberType: 'contact',
          userId: null,
          contactId: dto.contactId,
        },
      ]);

      await tx.insert(debtEvents).values({
        debtId: created.id,
        type: 'created',
        amount: String(dto.amount),
        occurredAt: new Date(),
        notes: dto.description ?? null,
      });

      return this.serializeDebt(created);
    });
  }

  async settleDebt(
    userId: string,
    debtId: string,
    dto: SettleDebtDto,
  ): Promise<DebtEventResponse> {
    const debt = await this.getDebt(userId, debtId);

    if (debt.status !== 'open') {
      throw new BadRequestException('Debt is not open');
    }

    if (dto.amount > Number(debt.remainingAmount)) {
      throw new BadRequestException('Settlement exceeds remaining amount');
    }

    return this.drizzle.db.transaction(async (tx) => {
      const transaction = await this.transactionsService.createTransaction(
        userId,
        {
          kind: debt.direction === 'owed_by_me' ? 'expense' : 'income',
          amount: dto.amount,
          accountId: dto.accountId,
          description: dto.notes ?? `Settlement for debt ${debt.id}`,
          occurredAt: new Date(),
        },
      );

      const nextRemaining = Number(debt.remainingAmount) - dto.amount;
      const nextStatus = nextRemaining <= 0 ? 'settled' : 'open';

      const [updatedDebt] = await tx
        .update(debts)
        .set({
          remainingAmount: String(nextRemaining),
          status: nextStatus,
          updatedAt: new Date(),
        })
        .where(eq(debts.id, debt.id))
        .returning();

      if (!updatedDebt) {
        throw new BadRequestException('Unable to update debt');
      }

      const [event] = await tx
        .insert(debtEvents)
        .values({
          debtId: debt.id,
          type: 'settled',
          amount: String(dto.amount),
          occurredAt: new Date(),
          transactionId: transaction.id,
          notes: dto.notes ?? null,
        })
        .returning();

      if (!event) {
        throw new BadRequestException('Unable to log settlement');
      }

      return this.serializeEvent(event);
    });
  }

  async listHistory(
    userId: string,
    debtId: string,
  ): Promise<DebtEventResponse[]> {
    await this.getDebt(userId, debtId);

    const rows = await this.drizzle.db
      .select()
      .from(debtEvents)
      .where(eq(debtEvents.debtId, debtId));

    return rows.map((row) => this.serializeEvent(row));
  }

  private async getDebt(userId: string, debtId: string): Promise<Debt> {
    const [debt] = await this.drizzle.db
      .select()
      .from(debts)
      .where(and(eq(debts.id, debtId), eq(debts.ownerId, userId)));

    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    return debt;
  }

  private serializeDebt(debt: Debt): DebtResponse {
    return {
      id: debt.id,
      ownerId: debt.ownerId,
      contactId: debt.contactId,
      direction: debt.direction,
      totalAmount: Number(debt.totalAmount),
      remainingAmount: Number(debt.remainingAmount),
      currency: debt.currency,
      description: debt.description,
      status: debt.status,
      createdAt: debt.createdAt.toISOString(),
      updatedAt: debt.updatedAt.toISOString(),
    };
  }

  private serializeEvent(event: {
    id: string;
    debtId: string;
    type: 'created' | 'settled' | 'adjusted';
    amount: string;
    occurredAt: Date;
    transactionId?: string | null;
    notes?: string | null;
  }): DebtEventResponse {
    return {
      id: event.id,
      debtId: event.debtId,
      type: event.type,
      amount: Number(event.amount),
      occurredAt: event.occurredAt.toISOString(),
      transactionId: event.transactionId ?? null,
      notes: event.notes ?? null,
    };
  }
}
