export interface TransactionResponse {
  id: string;
  userId: string;
  kind: 'income' | 'expense' | 'transfer';
  amount: number;
  accountId?: string | null;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  categoryId?: string | null;
  description?: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  reversedAt?: string | null;
  reversalOfId?: string | null;
  isReversal: boolean;
  installmentPlanId?: string | null;
}

export interface StatementItem {
  id: string;
  type: 'installment' | 'purchase';
  amount: number;
  occurredAt: string;
  description?: string | null;
}

export interface CreditCardStatementResponse {
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  totalDue: number;
  items: StatementItem[];
}
