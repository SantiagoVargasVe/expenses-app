import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTransaction, getTransactions } from "./api";
import type { CreateTransactionPayload, Transaction } from "./types";

const transactionsQueryKey = ["transactions"] as const;

export function useTransactionsQuery() {
  return useQuery({
    queryKey: transactionsQueryKey,
    queryFn: getTransactions,
  });
}

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      createTransaction(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<Transaction[]>(transactionsQueryKey, (prev) =>
        prev ? [data, ...prev] : [data],
      );
    },
  });
}
