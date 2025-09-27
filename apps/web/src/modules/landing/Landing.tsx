export default function LandingPage() {
  return (
    <div className="bg-neutral-0 min-h-screen text-neutral-900">
      <Header />

      {/* Hero */}
      <section className="flex justify-center">
        <div className="container py-20 md:py-28">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="bg-neutral-0 text-caption inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-neutral-600 shadow-sm">
                <span className="bg-success-500 inline-block h-2 w-2 rounded-full" />
                New: Multi‑currency & COP/USD support
              </span>
              <h1 className="mt-6 text-4xl leading-tight font-semibold tracking-tight text-neutral-900 md:text-5xl">
                Take control of your{" "}
                <span className="text-brand-600">expenses</span> — simple, fast,
                and precise.
              </h1>
              <p className="mt-4 max-w-xl text-neutral-600">
                Track spending, categorize automatically, and understand your
                cash flow with effortless reports. No spreadsheets, no friction.
              </p>

              <div className="mt-8 flex items-start gap-3 sm:flex-row">
                <a
                  href="#signup"
                  className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-400 inline-flex items-center justify-center rounded-lg px-5 py-3 text-white shadow-md transition focus-visible:ring-2 focus-visible:outline-none"
                >
                  Start free
                </a>
                <a
                  href="#features"
                  className="bg-neutral-0 focus-visible:ring-brand-400 inline-flex items-center justify-center rounded-lg border border-neutral-200 px-5 py-3 text-neutral-900 shadow-sm transition hover:bg-neutral-50 focus-visible:ring-2 focus-visible:outline-none"
                >
                  See features
                </a>
              </div>

              <p className="text-caption mt-4 text-neutral-500">
                No credit card required • Cancel anytime
              </p>

              <div className="text-caption mt-8 hidden items-center gap-6 text-neutral-500 md:flex">
                <TrustBadge label="256‑bit encryption" />
                <TrustBadge label="Open banking connections" />
                <TrustBadge label="Export to CSV/Excel" />
              </div>
            </div>

            {/* Mocked preview card */}
            <div className="relative">
              <div className="bg-brand-200 absolute -top-10 -left-10 hidden h-24 w-24 rounded-full blur-3xl md:block" />
              <div className="bg-brand-300 absolute -right-8 -bottom-12 hidden h-28 w-28 rounded-full blur-3xl md:block" />
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-lg">
                <header className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-brand-500 h-2.5 w-2.5 rounded-full" />
                    <span className="text-body font-medium text-neutral-700">
                      Monthly Overview
                    </span>
                  </div>
                  <span className="text-caption text-neutral-500">
                    Sep 2025
                  </span>
                </header>
                <div className="grid gap-4 pt-4 md:grid-cols-3">
                  <Kpi label="Spent" value="$2,350" sub="↓ 8% MoM" />
                  <Kpi label="Budget left" value="$1,120" sub="of $3,470" />
                  <Kpi label="Top category" value="Food & Dining" sub="$640" />
                </div>
                <div className="mt-5 rounded-lg border border-neutral-200 p-4">
                  <div className="text-caption mb-2 flex items-center justify-between text-neutral-500">
                    <span>Categories</span>
                    <span>Amount</span>
                  </div>
                  <Bar label="Housing" value={72} className="bg-brand-500" />
                  <Bar
                    label="Food & Dining"
                    value={58}
                    className="bg-brand-400"
                  />
                  <Bar label="Transport" value={35} className="bg-brand-300" />
                  <Bar
                    label="Subscriptions"
                    value={22}
                    className="bg-brand-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="flex justify-center border-t border-neutral-200 bg-neutral-50"
      >
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-neutral-900">
              Everything you need to stay on budget
            </h2>
            <p className="mt-3 text-neutral-600">
              Simple tools that save time. Powerful insights when you need them.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <FeatureCard
              title="Smart categories"
              desc="Automatic tagging using merchant and pattern detection. Override anytime."
              icon={<IconTag />}
            />
            <FeatureCard
              title="Multi‑currency"
              desc="Track in COP, USD, and more. Real‑time conversion on reports."
              icon={<IconGlobe />}
            />
            <FeatureCard
              title="Reports & export"
              desc="Monthly breakdowns, trends, and CSV/Excel export for accountants."
              icon={<IconChart />}
            />
            <FeatureCard
              title="Bank sync"
              desc="Connect accounts securely and import transactions automatically."
              icon={<IconShield />}
            />
            <FeatureCard
              title="Shared wallets"
              desc="Invite family or teammates. Roles & permissions built‑in."
              icon={<IconUsers />}
            />
            <FeatureCard
              title="Reminders"
              desc="Set budgets and alerts. Never miss a bill again."
              icon={<IconBell />}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="signup" className="relative flex justify-center">
        <div className="container py-16 md:py-24">
          <div className="from-brand-600 to-brand-700 overflow-hidden rounded-2xl bg-gradient-to-br p-8 shadow-lg md:p-12">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-2xl font-semibold text-white md:text-3xl">
                  Start tracking in minutes
                </h3>
                <p className="text-brand-200 mt-2">
                  Free plan included. Upgrade anytime.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-end">
                <a
                  href="/signup"
                  className="text-brand-700 hover:bg-brand-50 focus-visible:ring-neutral-0 inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 shadow-md transition focus-visible:ring-2 focus-visible:outline-none"
                >
                  Create account
                </a>
                <a
                  href="/login"
                  className="border-brand-300/40 focus-visible:ring-neutral-0 inline-flex items-center justify-center rounded-lg border bg-transparent px-5 py-3 text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:outline-none"
                >
                  Sign in
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="bg-neutral-0/80 sticky top-0 z-20 flex justify-center border-b border-neutral-200/70 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <Logo />
          <span className="text-heading-3 font-medium text-neutral-900">
            Expensio
          </span>
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-body text-neutral-600 hover:text-neutral-900"
          >
            Features
          </a>
          <a
            href="#"
            className="text-body text-neutral-600 hover:text-neutral-900"
          >
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="text-body hidden text-neutral-700 hover:text-neutral-900 md:inline"
          >
            Sign in
          </a>
          <a
            href="#signup"
            className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-400 inline-flex items-center justify-center rounded-lg px-4 py-2 text-white shadow-sm transition focus-visible:ring-2 focus-visible:outline-none"
          >
            Start free
          </a>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="flex justify-center border-t border-neutral-200 bg-neutral-50">
      <div className="container py-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <a href="#" className="flex items-center gap-2">
            <Logo />
            <span className="text-heading-3 font-medium text-neutral-900">
              Expensio
            </span>
          </a>
          <div className="text-body flex flex-wrap items-center gap-x-6 gap-y-2 text-neutral-600">
            <a href="#" className="hover:text-neutral-900">
              Privacy
            </a>
            <a href="#" className="hover:text-neutral-900">
              Terms
            </a>
            <a href="#" className="hover:text-neutral-900">
              Security
            </a>
            <span className="text-neutral-400">
              © {new Date().getFullYear()} Expensio
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function TrustBadge({ label }: { label: string }) {
  return (
    <span className="bg-neutral-0 text-caption inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-neutral-600 shadow-sm">
      <span className="bg-success-100 inline-flex h-4 w-4 items-center justify-center rounded-full">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="text-success-600 h-3.5 w-3.5"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-4-4A1 1 0 015.707 8.793L8.75 11.836l6.543-6.543a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      {label}
    </span>
  );
}

function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-neutral-0 rounded-lg border border-neutral-200 p-4 shadow-sm">
      <div className="text-caption text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-neutral-900">
        {value}
      </div>
      {sub && <div className="text-caption mt-1 text-neutral-500">{sub}</div>}
    </div>
  );
}

function Bar({
  label,
  value,
  className = "",
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="mb-2">
      <div className="text-body mb-1 flex items-center justify-between text-neutral-700">
        <span>{label}</span>
        <span className="text-neutral-500">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-neutral-100">
        <div
          style={{ width: `${value}%` }}
          className={`h-2 rounded-full ${className}`}
        />
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className="text-brand-600 h-6 w-6">
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0%" stopColor="rgb(124,58,237)" />
          <stop offset="100%" stopColor="rgb(109,40,217)" />
        </linearGradient>
      </defs>
      <path
        fill="url(#g)"
        d="M16 3c7.18 0 13 5.82 13 13s-5.82 13-13 13S3 23.18 3 16 8.82 3 16 3Zm0 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z"
      />
      <circle cx="16" cy="16" r="4" fill="white" />
    </svg>
  );
}

function FeatureCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="bg-brand-50 text-brand-700 ring-brand-200 mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-neutral-900">{title}</h3>
      <p className="mt-1 text-neutral-600">{desc}</p>
    </div>
  );
}

function IconTag() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M10.586 3H7a2 2 0 0 0-2 2v3.586a2 2 0 0 0 .586 1.414l7.586 7.586a2 2 0 0 0 2.828 0l3.586-3.586a2 2 0 0 0 0-2.828L12 3.586A2 2 0 0 0 10.586 3Zm-3.172 4a1.414 1.414 0 1 1 2 2 1.414 1.414 0 0 1-2-2Z" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.938 9h-3.11a15.9 15.9 0 0 0-1.09-5.004A8.01 8.01 0 0 1 19.938 11ZM8.26 11H4.062a8.01 8.01 0 0 1 4.2-5.003A13.93 13.93 0 0 0 8.26 11Zm0 2a13.93 13.93 0 0 0 .002 5.003A8.01 8.01 0 0 1 4.062 13H8.26Zm1.74 0h4a12.2 12.2 0 0 1 0 5h-4a12.2 12.2 0 0 1 0-5Zm6.678 0h3.26A8.01 8.01 0 0 1 17.74 18.003 15.9 15.9 0 0 0 16.678 13ZM13 4.062A13.86 13.86 0 0 1 15.74 11h-3.74V4.062ZM11 4.062V11H7.26A13.86 13.86 0 0 1 11 4.062ZM8.26 13H11v6.938A13.86 13.86 0 0 1 8.26 13ZM13 19.938V13h3.74A13.86 13.86 0 0 1 13 19.938Z" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M4 5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v14H5a1 1 0 0 1-1-1V5Zm6 5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v9h-3a1 1 0 0 1-1-1v-8Zm6-4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v13h-3a1 1 0 0 1-1-1V6Z" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 2 4 5v6c0 5.25 3.438 10.313 8 11 4.562-.688 8-5.75 8-11V5l-8-3Z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-9 1a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.761 0-5 1.79-5 4v1h10v-1c0-2.21-2.239-4-5-4Zm9 0c-1.177 0-2.245.26-3.129.708A5.943 5.943 0 0 1 18 18v1h6v-1c0-2.21-2.239-4-5-4Z" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm8-6h-1V11a7 7 0 1 0-14 0v5H4a1 1 0 1 0 0 2h16a1 1 0 1 0 0-2Z" />
    </svg>
  );
}
