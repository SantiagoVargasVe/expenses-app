export type AccountType = "savings" | "credit_card";

export interface CreditCardProfile {
  creditLimit: number;
  availableCredit: number;
  statementCutoffDay: number;
  statementDueDay: number;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  creditCard?: CreditCardProfile | null;
}

export interface CreateCreditCardPayload {
  name: string;
  creditLimit: number;
  statementCutoffDay: number;
  statementDueDay: number;
}
