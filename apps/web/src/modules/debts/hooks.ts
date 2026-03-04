import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDebt, getDebtHistory, getDebts, settleDebt } from "./api";
import type { CreateDebtPayload, Debt, SettleDebtPayload } from "./types";

const debtsQueryKey = ["debts"] as const;

export function useDebtsQuery() {
  return useQuery({
    queryKey: debtsQueryKey,
    queryFn: getDebts,
  });
}

export function useDebtHistoryQuery(debtId: string) {
  return useQuery({
    queryKey: ["debts", debtId, "history"],
    queryFn: () => getDebtHistory(debtId),
    enabled: Boolean(debtId),
  });
}

export function useCreateDebtMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDebtPayload) => createDebt(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<Debt[]>(debtsQueryKey, (prev) =>
        prev ? [...prev, data] : [data],
      );
    },
  });
}

export function useSettleDebtMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ debtId, payload }: { debtId: string; payload: SettleDebtPayload }) =>
      settleDebt(debtId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: debtsQueryKey });
    },
  });
}
