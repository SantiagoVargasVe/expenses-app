import { Link } from "react-router";
import { useAccountsQuery } from "../accounts/hooks";
import { useTransactionsQuery } from "../transactions/hooks";
import { useRecurringRulesQuery } from "../recurring/hooks";
import { useDebtsQuery } from "../debts/hooks";

export function Dashboard() {
  const accountsQuery = useAccountsQuery();
  const transactionsQuery = useTransactionsQuery();
  const recurringQuery = useRecurringRulesQuery();
  const debtsQuery = useDebtsQuery();

  const accounts = accountsQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];
  const recurring = recurringQuery.data ?? [];
  const debts = debtsQuery.data ?? [];

  const totalBalance = accounts.reduce(
    (sum, account) => sum + Number(account.balance ?? 0),
    0,
  );
  const recentTransactions = transactions.slice(0, 4);
  const upcomingRecurring = recurring.slice(0, 3);
  const openDebts = debts.filter((debt) => debt.status === "open");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Dashboard
          </h1>
          <p className="text-sm text-neutral-600">
            Overview of your cash flow and obligations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/transactions/new"
            className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-400 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition focus-visible:ring-2 focus-visible:outline-none"
          >
            Add transaction
          </Link>
          <Link
            to="/accounts/new"
            className="border-neutral-200 bg-neutral-0 hover:bg-neutral-50 focus-visible:ring-brand-400 inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium text-neutral-700 transition focus-visible:ring-2 focus-visible:outline-none"
          >
            Add account
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          label="Total balance"
          value={totalBalance.toLocaleString("en-US", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          })}
          sub={`${accounts.length} accounts`}
        />
        <KpiCard
          label="Transactions"
          value={`${transactions.length}`}
          sub="All time"
        />
        <KpiCard
          label="Recurring"
          value={`${recurring.length}`}
          sub="Active rules"
        />
        <KpiCard
          label="Open debts"
          value={`${openDebts.length}`}
          sub="Outstanding"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Recent transactions"
          linkLabel="View all"
          linkTo="/transactions"
        >
          {transactionsQuery.isLoading ? (
            <p className="text-sm text-neutral-600">Loading transactions...</p>
          ) : recentTransactions.length ? (
            <div className="space-y-3">
              {recentTransactions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="text-neutral-900">{item.description ?? "—"}</p>
                    <p className="text-xs text-neutral-500">{item.kind}</p>
                  </div>
                  <span className="font-medium text-neutral-900">
                    {Number(item.amount).toLocaleString("en-US", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-600">
              No transactions yet. Add your first one.
            </p>
          )}
        </Panel>

        <Panel title="Upcoming recurring" linkLabel="Manage" linkTo="/recurring">
          {recurringQuery.isLoading ? (
            <p className="text-sm text-neutral-600">Loading recurring...</p>
          ) : upcomingRecurring.length ? (
            <div className="space-y-3">
              {upcomingRecurring.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="text-neutral-900">{rule.name}</p>
                    <p className="text-xs text-neutral-500">
                      {rule.frequency} • {rule.kind}
                    </p>
                  </div>
                  <span className="font-medium text-neutral-900">
                    {Number(rule.amount).toLocaleString("en-US", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-600">
              No recurring rules yet.
            </p>
          )}
        </Panel>

        <Panel title="Debts overview" linkLabel="View" linkTo="/debts">
          {debtsQuery.isLoading ? (
            <p className="text-sm text-neutral-600">Loading debts...</p>
          ) : debts.length ? (
            <div className="space-y-3">
              {debts.slice(0, 3).map((debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="text-neutral-900">
                      {debt.direction === "owed_by_me" ? "I owe" : "They owe me"}
                    </p>
                    <p className="text-xs text-neutral-500">{debt.status}</p>
                  </div>
                  <span className="font-medium text-neutral-900">
                    {Number(debt.remainingAmount).toLocaleString("en-US", {
                      style: "currency",
                      currency: debt.currency,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-600">
              No debts tracked yet.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-900">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{sub}</p>
    </div>
  );
}

function Panel({
  title,
  linkLabel,
  linkTo,
  children,
}: {
  title: string;
  linkLabel: string;
  linkTo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
        <Link
          to={linkTo}
          className="text-brand-600 text-xs font-medium hover:underline"
        >
          {linkLabel}
        </Link>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
