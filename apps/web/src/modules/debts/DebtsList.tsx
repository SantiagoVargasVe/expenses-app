import { Link } from "react-router";
import { usePeopleQuery } from "../people/hooks";
import { useCreateDebtMutation, useDebtsQuery } from "./hooks";
import { useState } from "react";
import type { DebtDirection } from "./types";
import { z } from "zod";
import { getFieldErrors } from "../../lib/api-errors";

export function DebtsList() {
  const { data: debts, isLoading, error } = useDebtsQuery();
  const { data: contacts } = usePeopleQuery();
  const createMutation = useCreateDebtMutation();
  const serverFieldErrors = getFieldErrors(createMutation.error);
  const [direction, setDirection] = useState<DebtDirection>("owed_by_me");
  const [contactId, setContactId] = useState("");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{
    contactId?: string;
    direction?: string;
    amount?: string;
    description?: string;
  }>({});

  const createSchema = z.object({
    contactId: z.string().min(1, "Contact is required"),
    direction: z.enum(["owed_by_me", "owed_to_me"]),
    amount: z.number().positive("Amount must be greater than zero"),
    description: z.string().optional(),
  });

  if (isLoading) {
    return <div className="p-6 text-neutral-600">Loading debts...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-error-600">
        Unable to load debts. Please try again.
      </div>
    );
  }

  const contactById = new Map(
    contacts?.map((contact) => [contact.id, contact.name]) ?? [],
  );

  return (
    <div className="bg-neutral-50 min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Debts</h1>
            <p className="text-sm text-neutral-600">
              Track money you owe or are owed.
            </p>
          </div>
          <Link
            to="/people"
            className="text-brand-600 text-sm font-medium hover:underline"
          >
            Manage people
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">
            Add new debt
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select
              value={direction}
              onChange={(event) => setDirection(event.target.value as DebtDirection)}
              className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
            >
              <option value="owed_by_me">I owe</option>
              <option value="owed_to_me">They owe me</option>
            </select>
            <select
              value={contactId}
              onChange={(event) => setContactId(event.target.value)}
              className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
            >
              <option value="">Select contact</option>
              {contacts?.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
            />
          </div>
          <button
            type="button"
            disabled={!contactId || amount <= 0 || createMutation.isPending}
            onClick={() => {
              const parsed = createSchema.safeParse({
                contactId,
                direction,
                amount,
                description: description || undefined,
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
              createMutation.mutate(parsed.data);
            }}
            className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-400 mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending ? "Creating..." : "Create debt"}
          </button>
          {errors.direction ?? serverFieldErrors.direction ? (
            <p className="mt-2 text-xs text-error-600">
              {errors.direction ?? serverFieldErrors.direction}
            </p>
          ) : null}
          {errors.contactId ?? serverFieldErrors.contactId ? (
            <p className="mt-2 text-xs text-error-600">
              {errors.contactId ?? serverFieldErrors.contactId}
            </p>
          ) : null}
          {errors.amount ?? serverFieldErrors.amount ? (
            <p className="mt-2 text-xs text-error-600">
              {errors.amount ?? serverFieldErrors.amount}
            </p>
          ) : null}
          {errors.description ?? serverFieldErrors.description ? (
            <p className="mt-2 text-xs text-error-600">
              {errors.description ?? serverFieldErrors.description}
            </p>
          ) : null}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {debts?.length ? (
            debts.map((debt) => (
              <Link
                key={debt.id}
                to={`/debts/${debt.id}`}
                className="border-neutral-200 rounded-xl border bg-white p-5 shadow-sm transition hover:border-brand-200"
              >
                <p className="text-sm text-neutral-500">
                  {debt.direction === "owed_by_me" ? "I owe" : "They owe me"}
                </p>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {contactById.get(debt.contactId) ?? "Unknown"}
                </h3>
                <p className="text-sm text-neutral-600">
                  Remaining {debt.remainingAmount.toLocaleString("en-US", {
                    style: "currency",
                    currency: debt.currency,
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-neutral-500">Status: {debt.status}</p>
              </Link>
            ))
          ) : (
            <div className="border-neutral-200 rounded-xl border bg-white p-6 text-neutral-600">
              No debts yet. Create one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
