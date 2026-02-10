import type {
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../lib/api-client";
import { loginUser, registerUser } from "./api";
import type { AuthResponse, LoginPayload, RegisterPayload } from "./types";

export const authQueryKey = ["auth", "user"] as const;

type AuthMutationOptions<TPayload> = Omit<
  UseMutationOptions<AuthResponse, ApiError, TPayload, unknown>,
  "mutationFn"
>;

function useAuthMutation<TPayload>(
  mutationFn: (payload: TPayload) => Promise<AuthResponse>,
  options?: AuthMutationOptions<TPayload>,
): UseMutationResult<AuthResponse, ApiError, TPayload, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.setQueryData(authQueryKey, data.user);
      options?.onSuccess?.(data, variables, context, mutation);
    },
    ...options,
  });
}

export function useRegisterMutation(
  options?: AuthMutationOptions<RegisterPayload>,
) {
  return useAuthMutation(registerUser, options);
}

export function useLoginMutation(options?: AuthMutationOptions<LoginPayload>) {
  return useAuthMutation(loginUser, options);
}

export function useAuthUser() {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<AuthResponse["user"]>(authQueryKey);
}
