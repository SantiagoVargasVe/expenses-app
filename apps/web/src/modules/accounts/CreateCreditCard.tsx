import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { useCreateCreditCardMutation } from "./hooks";
import { getFieldErrors } from "../../lib/api-errors";

const creditCardSchema = z.object({
  name: z.string().min(2, "Name is required"),
  creditLimit: z.number().positive("Credit limit must be greater than 0"),
  statementCutoffDay: z.number().int().min(1).max(31),
  statementDueDay: z.number().int().min(1).max(31),
});

type CreditCardFormValues = z.infer<typeof creditCardSchema>;

type FieldErrors = Partial<Record<keyof CreditCardFormValues, string>>;

export function CreateCreditCard() {
  const navigate = useNavigate();
  const createMutation = useCreateCreditCardMutation();
  const serverFieldErrors = getFieldErrors(createMutation.error);
  const [values, setValues] = useState<CreditCardFormValues>({
    name: "",
    creditLimit: 0,
    statementCutoffDay: 20,
    statementDueDay: 5,
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const canSubmit = useMemo(() => {
    return !createMutation.isPending;
  }, [createMutation.isPending]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = creditCardSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CreditCardFormValues;
        nextErrors[field] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await createMutation.mutateAsync(parsed.data);
    navigate("/accounts");
  };

  return (
    <div className="bg-neutral-50 min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <Link
          to="/accounts"
          className="text-brand-600 text-sm font-medium hover:underline"
        >
          Back to accounts
        </Link>

        <div className="border-neutral-200 mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Add a credit card
          </h1>
          <p className="text-sm text-neutral-600">
            Track statement dates and available credit.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
              Card name
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
              Credit limit (COP)
              <input
                type="number"
                value={values.creditLimit}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    creditLimit: Number(event.target.value),
                  }))
                }
                className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
              />
              {errors.creditLimit ?? serverFieldErrors.creditLimit ? (
                <span className="text-xs text-error-600">
                  {errors.creditLimit ?? serverFieldErrors.creditLimit}
                </span>
              ) : null}
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
                Statement cutoff day
                <input
                  type="number"
                  value={values.statementCutoffDay}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      statementCutoffDay: Number(event.target.value),
                    }))
                  }
                  className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
                />
                {errors.statementCutoffDay ??
                serverFieldErrors.statementCutoffDay ? (
                  <span className="text-xs text-error-600">
                    {errors.statementCutoffDay ??
                      serverFieldErrors.statementCutoffDay}
                  </span>
                ) : null}
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-800">
                Statement due day
                <input
                  type="number"
                  value={values.statementDueDay}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      statementDueDay: Number(event.target.value),
                    }))
                  }
                  className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
                />
                {errors.statementDueDay ?? serverFieldErrors.statementDueDay ? (
                  <span className="text-xs text-error-600">
                    {errors.statementDueDay ?? serverFieldErrors.statementDueDay}
                  </span>
                ) : null}
              </label>
            </div>

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
              {createMutation.isPending ? "Creating..." : "Create card"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
