import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelInstallments,
  getInstallments,
  getStatement,
  prepayInstallments,
} from "./api";

export function useStatementQuery(accountId: string) {
  return useQuery({
    queryKey: ["credit-cards", accountId, "statement"],
    queryFn: () => getStatement(accountId),
    enabled: Boolean(accountId),
  });
}

export function useInstallmentsQuery(accountId: string) {
  return useQuery({
    queryKey: ["credit-cards", accountId, "installments"],
    queryFn: () => getInstallments(accountId),
    enabled: Boolean(accountId),
  });
}

export function usePrepayInstallmentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => prepayInstallments(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useCancelInstallmentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => cancelInstallments(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
