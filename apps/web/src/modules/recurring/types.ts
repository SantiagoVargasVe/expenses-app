export type RecurringType = "auto_post" | "manual_due";
export type RecurringFrequency = "daily" | "weekly" | "monthly";
export type RecurringStatus = "active" | "paused";
export type TransactionKind = "income" | "expense" | "transfer";

export interface RecurringRule {
  id: string;
  userId: string;
  name: string;
  type: RecurringType;
  frequency: RecurringFrequency;
  interval: number;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  kind: TransactionKind;
  amount: number;
  accountId?: string | null;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  categoryId?: string | null;
  description?: string | null;
  startDate: string;
  nextRunAt: string;
  lastRunAt?: string | null;
  status: RecurringStatus;
}

export interface CreateRecurringPayload {
  name: string;
  type: RecurringType;
  frequency: RecurringFrequency;
  interval?: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  kind: TransactionKind;
  amount: number;
  accountId?: string;
  fromAccountId?: string;
  toAccountId?: string;
  description?: string;
  startDate?: string;
}
