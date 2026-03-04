import { Link, useParams } from "react-router";
import {
  useCancelInstallmentsMutation,
  useInstallmentsQuery,
  usePrepayInstallmentsMutation,
  useStatementQuery,
} from "../credit-cards/hooks";
import { useAccountQuery } from "./hooks";

export function AccountDetail() {
  const { id } = useParams();
  const { data, isLoading, error } = useAccountQuery(id ?? "");
  const isCreditCard = data?.type === "credit_card";
  const statementQuery = useStatementQuery(isCreditCard ? data.id : "");
  const installmentsQuery = useInstallmentsQuery(isCreditCard ? data.id : "");
  const prepayMutation = usePrepayInstallmentsMutation();
  const cancelMutation = useCancelInstallmentsMutation();

  if (isLoading) {
    return <div className="p-6 text-neutral-600">Loading account...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-error-600">Account not found.</p>
        <Link
          to="/accounts"
          className="text-brand-600 mt-4 inline-flex text-sm font-medium hover:underline"
        >
          Back to accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          to="/accounts"
          className="text-brand-600 text-sm font-medium hover:underline"
        >
          Back to accounts
        </Link>

        <div className="border-neutral-200 mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">
                {data.type === "credit_card" ? "Credit card" : "Savings"}
              </p>
              <h1 className="text-2xl font-semibold text-neutral-900">
                {data.name}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500">Balance</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {data.balance.toLocaleString("en-US", {
                  style: "currency",
                  currency: data.currency,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          {data.creditCard ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs text-neutral-500">Credit limit</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {data.creditCard.creditLimit.toLocaleString("en-US", {
                    style: "currency",
                    currency: data.currency,
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs text-neutral-500">Available credit</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {data.creditCard.availableCredit.toLocaleString("en-US", {
                    style: "currency",
                    currency: data.currency,
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs text-neutral-500">Statement cutoff</p>
                <p className="text-lg font-semibold text-neutral-900">
                  Day {data.creditCard.statementCutoffDay}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs text-neutral-500">Statement due</p>
                <p className="text-lg font-semibold text-neutral-900">
                  Day {data.creditCard.statementDueDay}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {data.creditCard ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900">
                Current statement
              </h2>
              {statementQuery.isLoading ? (
                <p className="mt-3 text-sm text-neutral-600">
                  Loading statement...
                </p>
              ) : statementQuery.data ? (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-600">
                    <span>
                      Period:{" "}
                      {new Date(
                        statementQuery.data.periodStart,
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        statementQuery.data.periodEnd,
                      ).toLocaleDateString()}
                    </span>
                    <span>
                      Due:{" "}
                      {new Date(
                        statementQuery.data.dueDate,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-xs text-neutral-500">Total due</p>
                    <p className="text-xl font-semibold text-neutral-900">
                      {statementQuery.data.totalDue.toLocaleString("en-US", {
                        style: "currency",
                        currency: data.currency,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {statementQuery.data.items.length ? (
                      statementQuery.data.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm"
                        >
                          <div>
                            <p className="text-neutral-900">
                              {item.description || "Statement item"}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {item.type === "installment"
                                ? "Installment"
                                : "Purchase"}{" "}
                              •{" "}
                              {new Date(item.occurredAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="font-medium text-neutral-900">
                            {item.amount.toLocaleString("en-US", {
                              style: "currency",
                              currency: data.currency,
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-neutral-600">
                        No items in this statement.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-neutral-600">
                  No statement data yet.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900">
                Installment plans
              </h2>
              {installmentsQuery.isLoading ? (
                <p className="mt-3 text-sm text-neutral-600">
                  Loading installments...
                </p>
              ) : installmentsQuery.data?.length ? (
                <div className="mt-4 space-y-4">
                  {installmentsQuery.data.map((plan) => (
                    <div
                      key={plan.id}
                      className="rounded-xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {plan.installmentsRemaining} of{" "}
                            {plan.installmentsTotal} remaining
                          </p>
                          <p className="text-xs text-neutral-500">
                            Status: {plan.status}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-neutral-500">Total</p>
                          <p className="text-sm font-semibold text-neutral-900">
                            {plan.totalAmount.toLocaleString("en-US", {
                              style: "currency",
                              currency: data.currency,
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                      </div>

                      {plan.status === "active" ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => prepayMutation.mutate(plan.id)}
                            disabled={prepayMutation.isPending}
                            className="border-neutral-200 hover:border-brand-300 hover:text-brand-700 inline-flex items-center justify-center rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition disabled:opacity-60"
                          >
                            Prepay remaining
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelMutation.mutate(plan.id)}
                            disabled={cancelMutation.isPending}
                            className="border-neutral-200 hover:border-error-300 hover:text-error-700 inline-flex items-center justify-center rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition disabled:opacity-60"
                          >
                            Cancel remaining
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-neutral-600">
                  No installment plans yet.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
