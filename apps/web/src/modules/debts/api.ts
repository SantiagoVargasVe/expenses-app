import { apiRequest } from "../../lib/api-client";
import type {
  CreateDebtPayload,
  Debt,
  DebtEvent,
  SettleDebtPayload,
} from "./types";

const DEBTS_ENDPOINT = "/debts";

export function getDebts(): Promise<Debt[]> {
  return apiRequest<Debt[]>(DEBTS_ENDPOINT);
}

export function createDebt(payload: CreateDebtPayload): Promise<Debt> {
  return apiRequest<Debt>(DEBTS_ENDPOINT, {
    method: "POST",
    body: payload,
  });
}

export function settleDebt(
  debtId: string,
  payload: SettleDebtPayload,
): Promise<DebtEvent> {
  return apiRequest<DebtEvent>(`${DEBTS_ENDPOINT}/${debtId}/settle`, {
    method: "POST",
    body: payload,
  });
}

export function getDebtHistory(debtId: string): Promise<DebtEvent[]> {
  return apiRequest<DebtEvent[]>(`${DEBTS_ENDPOINT}/${debtId}/history`);
}
