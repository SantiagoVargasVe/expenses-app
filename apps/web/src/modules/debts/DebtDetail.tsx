import { Link, useParams } from "react-router";
import { useAccountsQuery } from "../accounts/hooks";
import { usePeopleQuery } from "../people/hooks";
import { useDebtHistoryQuery, useDebtsQuery, useSettleDebtMutation } from "./hooks";
import { useState } from "react";
import { z } from "zod";
import { getFieldErrors } from "../../lib/api-errors";

export function DebtDetail() {
  const { id } = useParams();
  const { data: debts } = useDebtsQuery();
  const { data: contacts } = usePeopleQuery();
  const { data: accounts } = useAccountsQuery();
  const historyQuery = useDebtHistoryQuery(id ?? "");
  const settleMutation = useSettleDebtMutation();
  const serverFieldErrors = getFieldErrors(settleMutation.error);
  const [amount, setAmount] = useState(0);
  const [accountId, setAccountId] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{
    amount?: string;
    accountId?: string;
    notes?: string;
  }>({});

  const settleSchema = z.object({
    amount: z.number().positive("Amount must be greater than zero"),
    accountId: z.string().min(1, "Account is required"),
    notes: z.string().optional(),
  });

  const debt = debts?.find((item) => item.id === id);
  const contactName = contacts?.find((contact) => contact.id === debt?.contactId)?.name ?? "Unknown";

  if (!debt) {
    return (
      <div className="p-6">
        <p className="text-error-600">Debt not found.</p>
        <Link to="/debts" className="text-brand-600 text-sm font-medium hover:underline">
          Back to debts
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <Link to="/debts" className="text-brand-600 text-sm font-medium hover:underline">
          Back to debts
        </Link>

        <div className="border-neutral-200 mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">
                {debt.direction === "owed_by_me" ? "I owe" : "They owe me"}
              </p>
              <h1 className="text-2xl font-semibold text-neutral-900">
                {contactName}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500">Remaining</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {debt.remainingAmount.toLocaleString("en-US", {
                  style: "currency",
                  currency: debt.currency,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
            />
            <select
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
            >
              <option value="">Select account</option>
              {accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
            />
          </div>
          <button
            type="button"
            disabled={amount <= 0 || !accountId || settleMutation.isPending}
            onClick={() => {
              const parsed = settleSchema.safeParse({
                amount,
                accountId,
                notes: notes || undefined,
              });
              if (!parsed.success) {
                const nextErrors: typeof errors = {};
                parsed.error.issues.forEach((issue) => {
                  const field = issue.path[0] as keyof typeof errors;
                  nextErrors[field] = issue.message;
                });
                setErrors(nextErrors);
                return;
              }

              setErrors({});
              settleMutation.mutate({
                debtId: debt.id,
                payload: parsed.data,
              });
            }}
            className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-400 mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {settleMutation.isPending ? "Settling..." : "Settle debt"}
          </button>
          {errors.amount ?? serverFieldErrors.amount ? (
            <p className="mt-2 text-xs text-error-600">
              {errors.amount ?? serverFieldErrors.amount}
            </p>
          ) : null}
          {errors.accountId ?? serverFieldErrors.accountId ? (
            <p className="mt-2 text-xs text-error-600">
              {errors.accountId ?? serverFieldErrors.accountId}
            </p>
          ) : null}
          {errors.notes ?? serverFieldErrors.notes ? (
            <p className="mt-2 text-xs text-error-600">
              {errors.notes ?? serverFieldErrors.notes}
            </p>
          ) : null}
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">History</h2>
          {historyQuery.isLoading ? (
            <p className="mt-3 text-sm text-neutral-600">Loading history...</p>
          ) : historyQuery.data?.length ? (
            <div className="mt-4 space-y-3">
              {historyQuery.data.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="text-neutral-900">{event.type}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(event.occurredAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-medium text-neutral-900">
                    {event.amount.toLocaleString("en-US", {
                      style: "currency",
                      currency: debt.currency,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-600">
              No events yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
