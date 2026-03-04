import { NavLink, Outlet, useNavigate } from "react-router";
import { useState } from "react";
import { useAuthUser, useLogoutMutation } from "../auth/hooks";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/accounts", label: "Accounts" },
  { to: "/transactions", label: "Transactions" },
  { to: "/recurring", label: "Recurring" },
  { to: "/people", label: "People" },
  { to: "/debts", label: "Debts" },
];

export function AppLayout() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoutMutation = useLogoutMutation({
    onSuccess: () => navigate("/", { replace: true }),
  });

  return (
    <div className="bg-neutral-50 min-h-screen text-neutral-900">
      <header className="bg-neutral-0/80 sticky top-0 z-30 border-b border-neutral-200/70 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-neutral-900">
              Expensio
            </span>
            <nav className="hidden items-center gap-4 md:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition ${
                      isActive
                        ? "text-brand-700"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-sm text-neutral-600 md:block">
              {user?.email ?? "Signed in"}
            </div>
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="border-neutral-200 bg-neutral-0 hover:bg-neutral-50 focus-visible:ring-brand-400 inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium text-neutral-700 transition focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign out"}
            </button>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              className="border-neutral-200 bg-neutral-0 hover:bg-neutral-50 focus-visible:ring-brand-400 inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium text-neutral-700 transition focus-visible:ring-2 focus-visible:outline-none md:hidden"
            >
              Menu
            </button>
          </div>
        </div>
        <div
          id="mobile-nav"
          className={`border-neutral-200/70 bg-neutral-0 md:hidden ${
            isMenuOpen ? "block" : "hidden"
          } border-t`}
        >
          <nav className="flex flex-col gap-2 px-4 py-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="text-xs text-neutral-500">{user?.email}</div>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
