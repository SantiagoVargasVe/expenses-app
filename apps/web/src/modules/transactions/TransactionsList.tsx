import { Link } from "react-router";
import { useAccountsQuery } from "../accounts/hooks";
import { useTransactionsQuery } from "./hooks";

export function TransactionsList() {
  const { data: accounts } = useAccountsQuery();
  const { data, isLoading, error } = useTransactionsQuery();

  if (isLoading) {
    return <div className="p-6 text-neutral-600">Loading transactions...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-error-600">
        Unable to load transactions. Please try again.
      </div>
    );
  }

  const accountNameById = new Map(
    accounts?.map((account) => [account.id, account.name]) ?? [],
  );

  return (
    <div className="bg-neutral-50 min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Transactions</h1>
            <p className="text-sm text-neutral-600">
              Review income, expenses, and transfers.
            </p>
          </div>
          <Link
            to="/transactions/new"
            className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-400 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition focus-visible:ring-2 focus-visible:outline-none"
          >
            Add transaction
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {data?.length ? (
            data.map((transaction) => (
              <div
                key={transaction.id}
                className="border-neutral-200 rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">
                      {transaction.kind.toUpperCase()} •{" "}
                      {new Date(transaction.occurredAt).toLocaleDateString()}
                    </p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {transaction.description || "No description"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Amount</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {transaction.amount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-neutral-600">
                  {transaction.kind === "transfer"
                    ? `From ${accountNameById.get(transaction.fromAccountId ?? "") ?? "Unknown"} to ${accountNameById.get(transaction.toAccountId ?? "") ?? "Unknown"}`
                    : `Account: ${accountNameById.get(transaction.accountId ?? "") ?? "Unknown"}`}
                </p>
              </div>
            ))
          ) : (
            <div className="border-neutral-200 rounded-xl border bg-white p-6 text-neutral-600">
              No transactions yet. Create your first entry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
