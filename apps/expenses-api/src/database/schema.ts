/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  boolean,
  pgEnum,
  pgTable,
  integer,
  numeric,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const accountTypeEnum = pgEnum('account_type', [
  'savings',
  'credit_card',
]);
export const transactionKindEnum = pgEnum('transaction_kind', [
  'income',
  'expense',
  'transfer',
]);
export const installmentPlanStatusEnum = pgEnum('installment_plan_status', [
  'active',
  'prepaid',
  'canceled',
]);
export const installmentItemStatusEnum = pgEnum('installment_item_status', [
  'open',
  'paid',
  'canceled',
]);
export const recurringTypeEnum = pgEnum('recurring_type', [
  'auto_post',
  'manual_due',
]);
export const recurringFrequencyEnum = pgEnum('recurring_frequency', [
  'daily',
  'weekly',
  'monthly',
]);
export const recurringStatusEnum = pgEnum('recurring_status', [
  'active',
  'paused',
]);
export const recurringInstanceStatusEnum = pgEnum('recurring_instance_status', [
  'due',
  'posted',
  'skipped',
]);
export const debtDirectionEnum = pgEnum('debt_direction', [
  'owed_by_me',
  'owed_to_me',
]);
export const debtStatusEnum = pgEnum('debt_status', [
  'open',
  'settled',
  'canceled',
]);
export const debtEventTypeEnum = pgEnum('debt_event_type', [
  'created',
  'settled',
  'adjusted',
]);
export const debtMemberTypeEnum = pgEnum('debt_member_type', [
  'user',
  'contact',
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id')
      .default(sql`gen_random_uuid()`)
      .primaryKey(),

    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    role: userRoleEnum('role').notNull().default('user'),
  },
  (users) => [uniqueIndex('users_email_idx').on(users.email)],
);

export const authSessions = pgTable('auth_sessions', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  rotatedAt: timestamp('rotated_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  userAgent: text('user_agent'),
  ip: varchar('ip', { length: 64 }),
});

export const accounts = pgTable('accounts', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 120 }).notNull(),
  type: accountTypeEnum('type').notNull(),
  balance: numeric('balance', { precision: 14, scale: 2 })
    .notNull()
    .default('0'),
  currency: varchar('currency', { length: 3 }).notNull().default('COP'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const creditCardProfiles = pgTable('credit_card_profiles', {
  accountId: uuid('account_id')
    .primaryKey()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  creditLimit: numeric('credit_limit', { precision: 14, scale: 2 })
    .notNull()
    .default('0'),
  availableCredit: numeric('available_credit', { precision: 14, scale: 2 })
    .notNull()
    .default('0'),
  statementCutoffDay: integer('statement_cutoff_day').notNull(),
  statementDueDay: integer('statement_due_day').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const categories = pgTable('categories', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 120 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  kind: transactionKindEnum('kind').notNull(),
  amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
  accountId: uuid('account_id').references(() => accounts.id, {
    onDelete: 'set null',
  }),
  fromAccountId: uuid('from_account_id').references(() => accounts.id, {
    onDelete: 'set null',
  }),
  toAccountId: uuid('to_account_id').references(() => accounts.id, {
    onDelete: 'set null',
  }),
  categoryId: uuid('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  description: text('description'),
  occurredAt: timestamp('occurred_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  reversedAt: timestamp('reversed_at', { withTimezone: true }),
  reversalOfId: uuid('reversal_of_id').references(() => transactions.id, {
    onDelete: 'set null',
  }),
  isReversal: boolean('is_reversal').notNull().default(false),
});

export const creditCardInstallmentPlans = pgTable(
  'credit_card_installment_plans',
  {
    id: uuid('id')
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    transactionId: uuid('transaction_id')
      .notNull()
      .references(() => transactions.id, { onDelete: 'cascade' }),
    totalAmount: numeric('total_amount', { precision: 14, scale: 2 }).notNull(),
    installmentsTotal: integer('installments_total').notNull(),
    installmentsRemaining: integer('installments_remaining').notNull(),
    status: installmentPlanStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
);

export const creditCardInstallmentItems = pgTable(
  'credit_card_installment_items',
  {
    id: uuid('id')
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => creditCardInstallmentPlans.id, {
        onDelete: 'cascade',
      }),
    installmentNumber: integer('installment_number').notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    status: installmentItemStatusEnum('status').notNull().default('open'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    canceledAt: timestamp('canceled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
);

export const recurringRules = pgTable('recurring_rules', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 160 }).notNull(),
  type: recurringTypeEnum('type').notNull(),
  frequency: recurringFrequencyEnum('frequency').notNull(),
  interval: integer('interval').notNull().default(1),
  dayOfWeek: integer('day_of_week'),
  dayOfMonth: integer('day_of_month'),
  kind: transactionKindEnum('kind').notNull(),
  amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
  accountId: uuid('account_id').references(() => accounts.id, {
    onDelete: 'set null',
  }),
  fromAccountId: uuid('from_account_id').references(() => accounts.id, {
    onDelete: 'set null',
  }),
  toAccountId: uuid('to_account_id').references(() => accounts.id, {
    onDelete: 'set null',
  }),
  categoryId: uuid('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  description: text('description'),
  startDate: timestamp('start_date', { withTimezone: true })
    .defaultNow()
    .notNull(),
  nextRunAt: timestamp('next_run_at', { withTimezone: true }).notNull(),
  lastRunAt: timestamp('last_run_at', { withTimezone: true }),
  status: recurringStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const recurringInstances = pgTable('recurring_instances', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  ruleId: uuid('rule_id')
    .notNull()
    .references(() => recurringRules.id, { onDelete: 'cascade' }),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  status: recurringInstanceStatusEnum('status').notNull().default('due'),
  transactionId: uuid('transaction_id').references(() => transactions.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const contacts = pgTable('contacts', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 160 }).notNull(),
  email: varchar('email', { length: 255 }),
  isDummy: boolean('is_dummy').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const debts = pgTable('debts', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id')
    .notNull()
    .references(() => contacts.id, { onDelete: 'cascade' }),
  direction: debtDirectionEnum('direction').notNull(),
  totalAmount: numeric('total_amount', { precision: 14, scale: 2 }).notNull(),
  remainingAmount: numeric('remaining_amount', {
    precision: 14,
    scale: 2,
  }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('COP'),
  description: text('description'),
  status: debtStatusEnum('status').notNull().default('open'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const debtMemberships = pgTable('debt_memberships', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  debtId: uuid('debt_id')
    .notNull()
    .references(() => debts.id, { onDelete: 'cascade' }),
  memberType: debtMemberTypeEnum('member_type').notNull(),
  userId: uuid('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }),
  contactId: uuid('contact_id').references(() => contacts.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const debtEvents = pgTable('debt_events', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  debtId: uuid('debt_id')
    .notNull()
    .references(() => debts.id, { onDelete: 'cascade' }),
  type: debtEventTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  transactionId: uuid('transaction_id').references(() => transactions.id, {
    onDelete: 'set null',
  }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = User['role'];
export type AuthSession = typeof authSessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type AccountType = Account['type'];
export type CreditCardProfile = typeof creditCardProfiles.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type TransactionKind = Transaction['kind'];
export type CreditCardInstallmentPlan =
  typeof creditCardInstallmentPlans.$inferSelect;
export type CreditCardInstallmentItem =
  typeof creditCardInstallmentItems.$inferSelect;
export type RecurringRule = typeof recurringRules.$inferSelect;
export type RecurringInstance = typeof recurringInstances.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Debt = typeof debts.$inferSelect;
export type DebtEvent = typeof debtEvents.$inferSelect;
