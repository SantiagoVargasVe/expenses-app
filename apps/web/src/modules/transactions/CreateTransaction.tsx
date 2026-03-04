import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { useAccountsQuery } from "../accounts/hooks";
import { useCreateTransactionMutation } from "./hooks";
import { getFieldErrors } from "../../lib/api-errors";
import type { TransactionKind } from "./types";

const transactionSchema = z.object({
  kind: z.enum(["income", "expense", "transfer"]),
  amount: z.number().positive("Amount must be greater than 0"),
  accountId: z.string().uuid().optional(),
  fromAccountId: z.string().uuid().optional(),
  toAccountId: z.string().uuid().optional(),
  description: z.string().optional(),
  occurredAt: z.string().optional(),
  installmentsTotal: z.number().int().min(1).max(60).optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

type FieldErrors = Partial<Record<keyof TransactionFormValues, string>>;

export function CreateTransaction() {
  const navigate = useNavigate();
  const { data: accounts } = useAccountsQuery();
  const createMutation = useCreateTransactionMutation();
  const serverFieldErrors = getFieldErrors(createMutation.error);
  const [values, setValues] = useState<TransactionFormValues>({
    kind: "expense",
    amount: 0,
    accountId: undefined,
    fromAccountId: undefined,
    toAccountId: undefined,
    description: "",
    occurredAt: new Date().toISOString().slice(0, 10),
    installmentsTotal: 1,
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const accountOptions = accounts ?? [];
  const requiresTransfer = values.kind === "transfer";
  const selectedAccount = accountOptions.find(
    (account) => account.id === values.accountId,
  );
  const supportsInstallments =
    !requiresTransfer &&
    values.kind === "expense" &&
    selectedAccount?.type === "credit_card";

  const canSubmit = useMemo(() => !createMutation.isPending, [createMutation.isPending]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = transactionSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof TransactionFormValues;
        nextErrors[field] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    if (requiresTransfer) {
      if (!values.fromAccountId || !values.toAccountId) {
        setErrors({
          fromAccountId: "From account is required",
          toAccountId: "To account is required",
        });
        return;
      }
    } else if (!values.accountId) {
      setErrors({ accountId: "Account is required" });
      return;
    }

    setErrors({});

    await createMutation.mutateAsync({
      kind: values.kind as TransactionKind,
      amount: values.amount,
      accountId: requiresTransfer ? undefined : values.accountId,
      fromAccountId: requiresTransfer ? values.fromAccountId : undefined,
      toAccountId: requiresTransfer ? values.toAccountId : undefined,
      description: values.description || undefined,
      occurredAt: values.occurredAt ? new Date(values.occurredAt).toISOString() : undefined,
      installmentsTotal:
        supportsInstallments && values.installmentsTotal && values.installmentsTotal > 1
          ? values.installmentsTotal
          : undefined,
    });

    navigate("/transactions");
  };

  return (
    <div className="bg-neutral-50 min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <Link
          to="/transactions"
          className="text-brand-600 text-sm font-medium hover:underline"
        >
          Back to transactions
        </Link>

        <div className="border-neutral-200 mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Add transaction
          </h1>
          <p className="text-sm text-neutral-600">
            Record income, expenses, or transfers.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
              Type
              <select
                value={values.kind}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    kind: event.target.value as TransactionKind,
                  }))
                }
                className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
            </label>

            {!requiresTransfer ? (
              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
                Account
                <select
                  value={values.accountId ?? ""}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      accountId: event.target.value || undefined,
                    }))
                  }
                  className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
                >
                  <option value="">Select account</option>
                  {accountOptions.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                {errors.accountId ?? serverFieldErrors.accountId ? (
                  <span className="text-xs text-error-600">
                    {errors.accountId ?? serverFieldErrors.accountId}
                  </span>
                ) : null}
              </label>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
                  From account
                  <select
                    value={values.fromAccountId ?? ""}
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        fromAccountId: event.target.value || undefined,
                      }))
                    }
                    className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
                  >
                    <option value="">Select account</option>
                    {accountOptions.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                  {errors.fromAccountId ?? serverFieldErrors.fromAccountId ? (
                    <span className="text-xs text-error-600">
                      {errors.fromAccountId ?? serverFieldErrors.fromAccountId}
                    </span>
                  ) : null}
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
                  To account
                  <select
                    value={values.toAccountId ?? ""}
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        toAccountId: event.target.value || undefined,
                      }))
                    }
                    className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
                  >
                    <option value="">Select account</option>
                    {accountOptions.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                  {errors.toAccountId ?? serverFieldErrors.toAccountId ? (
                    <span className="text-xs text-error-600">
                      {errors.toAccountId ?? serverFieldErrors.toAccountId}
                    </span>
                  ) : null}
                </label>
              </div>
            )}

            <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
              Amount (COP)
              <input
                type="number"
                value={values.amount}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    amount: Number(event.target.value),
                  }))
                }
                className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
              />
              {errors.amount ?? serverFieldErrors.amount ? (
                <span className="text-xs text-error-600">
                  {errors.amount ?? serverFieldErrors.amount}
                </span>
              ) : null}
            </label>

            {supportsInstallments ? (
              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
                Installments
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={values.installmentsTotal ?? 1}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      installmentsTotal: Number(event.target.value),
                    }))
                  }
                  className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
                />
              </label>
            ) : null}

            <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
              Description
              <input
                type="text"
                value={values.description ?? ""}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
              Date
              <input
                type="date"
                value={values.occurredAt ?? ""}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    occurredAt: event.target.value,
                  }))
                }
                className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
              />
            </label>

            {createMutation.error ? (
              <div className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700">
                {createMutation.error.message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-400 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation.isPending ? "Creating..." : "Create transaction"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
