import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRecurringRule,
  getRecurringRules,
  markRecurringPaid,
  runRecurringRule,
  updateRecurringRule,
} from "./api";
import type { CreateRecurringPayload, RecurringRule } from "./types";

const recurringQueryKey = ["recurring"] as const;

export function useRecurringRulesQuery() {
  return useQuery({
    queryKey: recurringQueryKey,
    queryFn: getRecurringRules,
  });
}

export function useCreateRecurringMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRecurringPayload) =>
      createRecurringRule(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<RecurringRule[]>(recurringQueryKey, (prev) =>
        prev ? [data, ...prev] : [data],
      );
    },
  });
}

export function useUpdateRecurringMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateRecurringPayload & { status?: string }> }) =>
      updateRecurringRule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringQueryKey });
    },
  });
}

export function useRunRecurringMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => runRecurringRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringQueryKey });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useMarkRecurringPaidMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markRecurringPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringQueryKey });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
