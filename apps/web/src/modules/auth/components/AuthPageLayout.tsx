import type { ReactNode } from "react";

interface AuthPageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthPageLayout({
  title,
  description,
  children,
  footer,
}: AuthPageLayoutProps) {
  return (
    <div className="bg-neutral-50 flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="border-neutral-200 bg-white shadow-lg shadow-brand-600/5 rounded-2xl border px-8 py-10">
          <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
          {description ? (
            <p className="text-neutral-600 mt-2 text-sm">{description}</p>
          ) : null}
          <div className="mt-8">{children}</div>
        </div>
        {footer ? (
          <div className="mt-6 text-center text-sm text-neutral-600">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
