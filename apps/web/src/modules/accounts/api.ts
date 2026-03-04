import { apiRequest } from "../../lib/api-client";
import type { Account, CreateCreditCardPayload } from "./types";

const ACCOUNTS_ENDPOINT = "/accounts";

export function getAccounts(): Promise<Account[]> {
  return apiRequest<Account[]>(ACCOUNTS_ENDPOINT);
}

export function getAccount(accountId: string): Promise<Account> {
  return apiRequest<Account>(`${ACCOUNTS_ENDPOINT}/${accountId}`);
}

export function createCreditCard(
  payload: CreateCreditCardPayload,
): Promise<Account> {
  return apiRequest<Account>(ACCOUNTS_ENDPOINT, {
    method: "POST",
    body: {
      ...payload,
      type: "credit_card",
    },
  });
}
