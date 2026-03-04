import { apiRequest } from "../../lib/api-client";
import type { CreateTransactionPayload, Transaction } from "./types";

const TRANSACTIONS_ENDPOINT = "/transactions";

export function getTransactions(): Promise<Transaction[]> {
  return apiRequest<Transaction[]>(TRANSACTIONS_ENDPOINT);
}

export function createTransaction(
  payload: CreateTransactionPayload,
): Promise<Transaction> {
  return apiRequest<Transaction>(TRANSACTIONS_ENDPOINT, {
    method: "POST",
    body: payload,
  });
}
