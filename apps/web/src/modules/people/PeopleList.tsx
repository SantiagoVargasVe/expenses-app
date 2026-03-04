import { useState } from "react";
import { Link } from "react-router";
import { useCreateContactMutation, usePeopleQuery } from "./hooks";
import { z } from "zod";
import { getFieldErrors } from "../../lib/api-errors";

export function PeopleList() {
  const { data, isLoading, error } = usePeopleQuery();
  const createMutation = useCreateContactMutation();
  const serverFieldErrors = getFieldErrors(createMutation.error);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const contactSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Email is invalid").optional(),
  });

  if (isLoading) {
    return <div className="p-6 text-neutral-600">Loading people...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-error-600">
        Unable to load people. Please try again.
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">People</h1>
            <p className="text-sm text-neutral-600">
              Manage contacts and dummy users.
            </p>
          </div>
          <Link
            to="/debts"
            className="text-brand-600 text-sm font-medium hover:underline"
          >
            View debts
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">
            Add a dummy contact
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border-neutral-200 focus-visible:ring-brand-400 rounded-lg border px-3 py-2 text-sm outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const parsed = contactSchema.safeParse({
                name,
                email: email || undefined,
              });
              if (!parsed.success) {
                const nextErrors: { name?: string; email?: string } = {};
                parsed.error.issues.forEach((issue) => {
                  const field = issue.path[0] as "name" | "email";
                  nextErrors[field] = issue.message;
                });
                setErrors(nextErrors);
                return;
              }

              setErrors({});
              createMutation.mutate(parsed.data);
            }}
            disabled={createMutation.isPending || !name}
            className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-400 mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending ? "Adding..." : "Add contact"}
          </button>
          {errors.name ?? serverFieldErrors.name ? (
            <p className="mt-2 text-xs text-error-600">
              {errors.name ?? serverFieldErrors.name}
            </p>
          ) : null}
          {errors.email ?? serverFieldErrors.email ? (
            <p className="mt-2 text-xs text-error-600">
              {errors.email ?? serverFieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {data?.length ? (
            data.map((contact) => (
              <div
                key={contact.id}
                className="border-neutral-200 rounded-xl border bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-neutral-500">
                  {contact.isDummy ? "Dummy" : "User"}
                </p>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {contact.name}
                </h3>
                {contact.email ? (
                  <p className="text-sm text-neutral-600">{contact.email}</p>
                ) : null}
              </div>
            ))
          ) : (
            <div className="border-neutral-200 rounded-xl border bg-white p-6 text-neutral-600">
              No contacts yet. Add a dummy contact to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
