import { apiRequest } from "../../lib/api-client";
import type { InstallmentPlan, StatementResponse } from "./types";

const CREDIT_CARD_ENDPOINT = "/credit-cards";

export function getStatement(accountId: string): Promise<StatementResponse> {
  return apiRequest<StatementResponse>(
    `${CREDIT_CARD_ENDPOINT}/${accountId}/statement`,
  );
}

export function getInstallments(
  accountId: string,
): Promise<InstallmentPlan[]> {
  return apiRequest<InstallmentPlan[]>(
    `${CREDIT_CARD_ENDPOINT}/${accountId}/installments`,
  );
}

export function prepayInstallments(planId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `${CREDIT_CARD_ENDPOINT}/installments/${planId}/prepay`,
    { method: "POST" },
  );
}

export function cancelInstallments(planId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `${CREDIT_CARD_ENDPOINT}/installments/${planId}/cancel`,
    { method: "POST" },
  );
}
