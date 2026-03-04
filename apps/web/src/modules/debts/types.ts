export type DebtDirection = "owed_by_me" | "owed_to_me";
export type DebtStatus = "open" | "settled" | "canceled";

export interface Debt {
  id: string;
  ownerId: string;
  contactId: string;
  direction: DebtDirection;
  totalAmount: number;
  remainingAmount: number;
  currency: string;
  description?: string | null;
  status: DebtStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DebtEvent {
  id: string;
  debtId: string;
  type: "created" | "settled" | "adjusted";
  amount: number;
  occurredAt: string;
  transactionId?: string | null;
  notes?: string | null;
}

export interface CreateDebtPayload {
  contactId: string;
  direction: DebtDirection;
  amount: number;
  description?: string;
}

export interface SettleDebtPayload {
  amount: number;
  accountId: string;
  notes?: string;
}
