export interface StatementItem {
  id: string;
  type: "installment" | "purchase";
  amount: number;
  occurredAt: string;
  description?: string | null;
}

export interface StatementResponse {
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  totalDue: number;
  items: StatementItem[];
}

export interface InstallmentItem {
  id: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: string;
}

export interface InstallmentPlan {
  id: string;
  transactionId: string;
  totalAmount: number;
  installmentsTotal: number;
  installmentsRemaining: number;
  status: string;
  items: InstallmentItem[];
}
