import { apiRequest } from "../../lib/api-client";
import type { CreateRecurringPayload, RecurringRule } from "./types";

const RECURRING_ENDPOINT = "/recurring";

export function getRecurringRules(): Promise<RecurringRule[]> {
  return apiRequest<RecurringRule[]>(RECURRING_ENDPOINT);
}

export function createRecurringRule(
  payload: CreateRecurringPayload,
): Promise<RecurringRule> {
  return apiRequest<RecurringRule>(RECURRING_ENDPOINT, {
    method: "POST",
    body: payload,
  });
}

export function updateRecurringRule(
  id: string,
  payload: Partial<CreateRecurringPayload & { status?: string }>,
): Promise<RecurringRule> {
  return apiRequest<RecurringRule>(`${RECURRING_ENDPOINT}/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function runRecurringRule(id: string): Promise<unknown> {
  return apiRequest(`${RECURRING_ENDPOINT}/${id}/run`, { method: "POST" });
}

export function markRecurringPaid(id: string): Promise<unknown> {
  return apiRequest(`${RECURRING_ENDPOINT}/${id}/mark-paid`, { method: "POST" });
}
