import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { useAccountsQuery } from "../accounts/hooks";
import { useCreateRecurringMutation } from "./hooks";
import { getFieldErrors } from "../../lib/api-errors";
import type { RecurringFrequency, RecurringType, TransactionKind } from "./types";

const recurringSchema = z.object({
  name: z.string().min(2, "Name is required"),
  type: z.enum(["auto_post", "manual_due"]),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  interval: z.number().int().min(1).max(31).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  kind: z.enum(["income", "expense", "transfer"]),
  amount: z.number().positive("Amount must be greater than 0"),
  accountId: z.string().uuid().optional(),
  fromAccountId: z.string().uuid().optional(),
  toAccountId: z.string().uuid().optional(),
  description: z.string().optional(),
});

type RecurringFormValues = z.infer<typeof recurringSchema>;

type FieldErrors = Partial<Record<keyof RecurringFormValues, string>>;

export function CreateRecurring() {
  const navigate = useNavigate();
  const { data: accounts } = useAccountsQuery();
  const createMutation = useCreateRecurringMutation();
  const serverFieldErrors = getFieldErrors(createMutation.error);
  const [values, setValues] = useState<RecurringFormValues>({
    name: "",
    type: "auto_post",
    frequency: "monthly",
    interval: 1,
    dayOfMonth: 1,
    kind: "expense",
    amount: 0,
    accountId: undefined,
    fromAccountId: undefined,
    toAccountId: undefined,
    description: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const requiresTransfer = values.kind === "transfer";
  const needsDayOfWeek = values.frequency === "weekly";
  const needsDayOfMonth = values.frequency === "monthly";

  const canSubmit = useMemo(() => !createMutation.isPending, [createMutation.isPending]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = recurringSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RecurringFormValues;
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

    if (needsDayOfWeek && values.dayOfWeek === undefined) {
      setErrors({ dayOfWeek: "Day of week is required" });
      return;
    }

    if (needsDayOfMonth && values.dayOfMonth === undefined) {
      setErrors({ dayOfMonth: "Day of month is required" });
      return;
    }

    setErrors({});

    await createMutation.mutateAsync({
      name: values.name,
      type: values.type as RecurringType,
      frequency: values.frequency as RecurringFrequency,
      interval: values.interval,
      dayOfWeek: values.dayOfWeek,
      dayOfMonth: values.dayOfMonth,
      kind: values.kind as TransactionKind,
      amount: values.amount,
      accountId: requiresTransfer ? undefined : values.accountId,
      fromAccountId: requiresTransfer ? values.fromAccountId : undefined,
      toAccountId: requiresTransfer ? values.toAccountId : undefined,
      description: values.description || undefined,
    });

    navigate("/recurring");
  };

  return (
    <div className="bg-neutral-50 min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <Link
          to="/recurring"
          className="text-brand-600 text-sm font-medium hover:underline"
        >
          Back to recurring
        </Link>

        <div className="border-neutral-200 mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Add recurring rule
          </h1>
          <p className="text-sm text-neutral-600">
            Automate recurring transactions or create due reminders.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
              Name
              <input
                type="text"
                value={values.name}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, name: event.target.value }))
                }
                className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
              />
              {errors.name ?? serverFieldErrors.name ? (
                <span className="text-xs text-error-600">
                  {errors.name ?? serverFieldErrors.name}
                </span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
              Type
              <select
                value={values.type}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    type: event.target.value as RecurringType,
                  }))
                }
                className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
              >
                <option value="auto_post">Auto post</option>
                <option value="manual_due">Manual due</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
              Frequency
              <select
                value={values.frequency}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    frequency: event.target.value as RecurringFrequency,
                  }))
                }
                className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
              Interval
              <input
                type="number"
                min={1}
                max={31}
                value={values.interval ?? 1}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    interval: Number(event.target.value),
                  }))
                }
                className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
              />
            </label>

            {needsDayOfWeek ? (
              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
                Day of week (0=Sun)
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={values.dayOfWeek ?? 0}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      dayOfWeek: Number(event.target.value),
                    }))
                  }
                  className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
                />
                {errors.dayOfWeek ?? serverFieldErrors.dayOfWeek ? (
                  <span className="text-xs text-error-600">
                    {errors.dayOfWeek ?? serverFieldErrors.dayOfWeek}
                  </span>
                ) : null}
              </label>
            ) : null}

            {needsDayOfMonth ? (
              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
                Day of month
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={values.dayOfMonth ?? 1}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      dayOfMonth: Number(event.target.value),
                    }))
                  }
                  className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
                />
                {errors.dayOfMonth ?? serverFieldErrors.dayOfMonth ? (
                  <span className="text-xs text-error-600">
                    {errors.dayOfMonth ?? serverFieldErrors.dayOfMonth}
                  </span>
                ) : null}
              </label>
            ) : null}

            <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
              Kind
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
                  {accounts?.map((account) => (
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
                    {accounts?.map((account) => (
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
                    {accounts?.map((account) => (
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
              {createMutation.isPending ? "Creating..." : "Create recurring"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
