import { Link } from "react-router";
import { useAccountsQuery } from "./hooks";

export function AccountsList() {
  const { data, isLoading, error } = useAccountsQuery();

  if (isLoading) {
    return <div className="p-6 text-neutral-600">Loading accounts...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-error-600">
        Unable to load accounts. Please try again.
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Accounts</h1>
            <p className="text-sm text-neutral-600">
              Track balances across savings and credit cards.
            </p>
          </div>
          <Link
            to="/accounts/new"
            className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-400 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition focus-visible:ring-2 focus-visible:outline-none"
          >
            Add credit card
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {data?.length ? (
            data.map((account) => (
              <Link
                key={account.id}
                to={`/accounts/${account.id}`}
                className="border-neutral-200 bg-white hover:border-brand-200 hover:shadow-md group rounded-xl border p-5 shadow-sm transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">
                      {account.type === "credit_card" ? "Credit card" : "Savings"}
                    </p>
                    <h2 className="text-lg font-semibold text-neutral-900">
                      {account.name}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Balance</p>
                    <p className="text-xl font-semibold text-neutral-900">
                      {account.balance.toLocaleString("en-US", {
                        style: "currency",
                        currency: account.currency,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>
                {account.creditCard ? (
                  <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                    <div className="flex items-center justify-between">
                      <span>Available credit</span>
                      <span className="font-medium">
                        {account.creditCard.availableCredit.toLocaleString("en-US", {
                          style: "currency",
                          currency: account.currency,
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  </div>
                ) : null}
              </Link>
            ))
          ) : (
            <div className="border-neutral-200 rounded-xl border bg-white p-6 text-neutral-600">
              No accounts found. Create a credit card to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
