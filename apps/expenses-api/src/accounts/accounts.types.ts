export interface CreditCardProfileResponse {
  creditLimit: number;
  availableCredit: number;
  statementCutoffDay: number;
  statementDueDay: number;
}

export interface AccountResponse {
  id: string;
  userId: string;
  name: string;
  type: 'savings' | 'credit_card';
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  creditCard?: CreditCardProfileResponse | null;
}
