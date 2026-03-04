import { Link } from "react-router";
import {
  useMarkRecurringPaidMutation,
  useRecurringRulesQuery,
  useRunRecurringMutation,
  useUpdateRecurringMutation,
} from "./hooks";

export function RecurringList() {
  const { data, isLoading, error } = useRecurringRulesQuery();
  const runMutation = useRunRecurringMutation();
  const markPaidMutation = useMarkRecurringPaidMutation();
  const updateMutation = useUpdateRecurringMutation();

  if (isLoading) {
    return <div className="p-6 text-neutral-600">Loading recurring rules...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-error-600">
        Unable to load recurring rules. Please try again.
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Recurring</h1>
            <p className="text-sm text-neutral-600">
              Manage recurring income, expenses, and transfers.
            </p>
          </div>
          <Link
            to="/recurring/new"
            className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-400 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition focus-visible:ring-2 focus-visible:outline-none"
          >
            Add recurring
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {data?.length ? (
            data.map((rule) => (
              <div
                key={rule.id}
                className="border-neutral-200 rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">
                      {rule.type === "auto_post" ? "Auto post" : "Manual due"} • {rule.frequency}
                    </p>
                    <p className="text-lg font-semibold text-neutral-900">{rule.name}</p>
                    <p className="text-xs text-neutral-500">
                      Next run {new Date(rule.nextRunAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Amount</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {rule.amount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => runMutation.mutate(rule.id)}
                    disabled={runMutation.isPending}
                    className="border-neutral-200 hover:border-brand-300 hover:text-brand-700 inline-flex items-center justify-center rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition disabled:opacity-60"
                  >
                    Run now
                  </button>
                  {rule.type === "manual_due" ? (
                    <button
                      type="button"
                      onClick={() => markPaidMutation.mutate(rule.id)}
                      disabled={markPaidMutation.isPending}
                      className="border-neutral-200 hover:border-brand-300 hover:text-brand-700 inline-flex items-center justify-center rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition disabled:opacity-60"
                    >
                      Mark paid
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() =>
                      updateMutation.mutate({
                        id: rule.id,
                        payload: {
                          status: rule.status === "active" ? "paused" : "active",
                        },
                      })
                    }
                    disabled={updateMutation.isPending}
                    className="border-neutral-200 hover:border-neutral-400 inline-flex items-center justify-center rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition disabled:opacity-60"
                  >
                    {rule.status === "active" ? "Pause" : "Resume"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="border-neutral-200 rounded-xl border bg-white p-6 text-neutral-600">
              No recurring rules yet. Create one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
