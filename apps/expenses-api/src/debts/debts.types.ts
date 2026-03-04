export interface DebtResponse {
  id: string;
  ownerId: string;
  contactId: string;
  direction: 'owed_by_me' | 'owed_to_me';
  totalAmount: number;
  remainingAmount: number;
  currency: string;
  description?: string | null;
  status: 'open' | 'settled' | 'canceled';
  createdAt: string;
  updatedAt: string;
}

export interface DebtEventResponse {
  id: string;
  debtId: string;
  type: 'created' | 'settled' | 'adjusted';
  amount: number;
  occurredAt: string;
  transactionId?: string | null;
  notes?: string | null;
}
