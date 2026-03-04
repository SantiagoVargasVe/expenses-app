import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCreditCard, getAccount, getAccounts } from "./api";
import type { Account, CreateCreditCardPayload } from "./types";

const accountsQueryKey = ["accounts"] as const;

export function useAccountsQuery() {
  return useQuery({
    queryKey: accountsQueryKey,
    queryFn: getAccounts,
  });
}

export function useAccountQuery(accountId: string) {
  return useQuery({
    queryKey: ["accounts", accountId],
    queryFn: () => getAccount(accountId),
    enabled: Boolean(accountId),
  });
}

export function useCreateCreditCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCreditCardPayload) => createCreditCard(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<Account[]>(accountsQueryKey, (prev) =>
        prev ? [...prev, data] : [data],
      );
    },
  });
}
