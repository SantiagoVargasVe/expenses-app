export type TransactionKind = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  userId: string;
  kind: TransactionKind;
  amount: number;
  accountId?: string | null;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  categoryId?: string | null;
  description?: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionPayload {
  kind: TransactionKind;
  amount: number;
  accountId?: string;
  fromAccountId?: string;
  toAccountId?: string;
  description?: string;
  occurredAt?: string;
  installmentsTotal?: number;
}
