export interface RecurringRuleResponse {
  id: string;
  userId: string;
  name: string;
  type: 'auto_post' | 'manual_due';
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  kind: 'income' | 'expense' | 'transfer';
  amount: number;
  accountId?: string | null;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  categoryId?: string | null;
  description?: string | null;
  startDate: string;
  nextRunAt: string;
  lastRunAt?: string | null;
  status: 'active' | 'paused';
}

export interface RecurringInstanceResponse {
  id: string;
  ruleId: string;
  dueDate: string;
  status: 'due' | 'posted' | 'skipped';
  transactionId?: string | null;
}
