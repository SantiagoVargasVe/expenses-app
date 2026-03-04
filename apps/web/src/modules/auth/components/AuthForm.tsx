import { Eye, EyeOff } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { AuthFormMode, AuthFormValues } from "../useAuthForm";
import { useAuthForm } from "../useAuthForm";

interface AuthFormProps {
  onSubmit: (values: AuthFormValues) => Promise<void>;
  submitLabel: string;
  mode: AuthFormMode;
  isSubmitting?: boolean;
  serverError?: string | null;
  serverFieldErrors?: Partial<Record<AuthFormField, string>>;
  additionalActions?: ReactNode;
  passwordAutoComplete?: "current-password" | "new-password";
}

export function AuthForm({
  onSubmit,
  submitLabel,
  mode,
  isSubmitting,
  serverError,
  serverFieldErrors,
  additionalActions,
  passwordAutoComplete,
}: AuthFormProps) {
  const form = useAuthForm({ mode, onSubmit });
  const passwordFieldAutoComplete =
    passwordAutoComplete ?? (mode === "signup" ? "new-password" : "current-password");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const emailError = form.errors.email ?? serverFieldErrors?.email;
  const passwordError = form.errors.password ?? serverFieldErrors?.password;
  const confirmPasswordError =
    form.errors.confirmPassword ?? serverFieldErrors?.confirmPassword;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        void form.handleSubmit(event).catch(() => undefined);
      }}
      noValidate
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className="border-neutral-200 focus-visible:ring-brand-400 w-full rounded-lg border bg-neutral-0 px-3 py-2 text-sm text-neutral-900 outline-none transition focus-visible:ring-2 disabled:opacity-60"
          value={form.values.email}
          onChange={(event) => form.handleChange("email", event.target.value)}
          onBlur={() => form.handleBlur("email")}
          disabled={isSubmitting}
        />
        {emailError ? (
          <p className="text-xs text-error-500">{emailError}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-neutral-800"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={passwordVisible ? "text" : "password"}
            placeholder="********"
            autoComplete={passwordFieldAutoComplete}
            className="border-neutral-200 focus-visible:ring-brand-400 w-full rounded-lg border bg-neutral-0 px-3 py-2 pr-10 text-sm text-neutral-900 outline-none transition focus-visible:ring-2 disabled:opacity-60"
            value={form.values.password}
            onChange={(event) => form.handleChange("password", event.target.value)}
            onBlur={() => form.handleBlur("password")}
            disabled={isSubmitting}
          />
          <button
            type="button"
            className="focus-visible:ring-brand-400 absolute inset-y-0 right-2 flex items-center text-neutral-500 transition hover:text-neutral-700 focus-visible:rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
            onClick={() => setPasswordVisible((prev) => !prev)}
            aria-pressed={passwordVisible}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            disabled={isSubmitting}
          >
            {passwordVisible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="sr-only">
              {passwordVisible ? "Hide password" : "Show password"}
            </span>
          </button>
        </div>
        {passwordError ? (
          <p className="text-xs text-error-500">{passwordError}</p>
        ) : null}
      </div>

      {mode === "signup" ? (
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-neutral-800"
            htmlFor="confirmPassword"
          >
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={confirmPasswordVisible ? "text" : "password"}
              placeholder="********"
              autoComplete="new-password"
              className="border-neutral-200 focus-visible:ring-brand-400 w-full rounded-lg border bg-neutral-0 px-3 py-2 pr-10 text-sm text-neutral-900 outline-none transition focus-visible:ring-2 disabled:opacity-60"
              value={form.values.confirmPassword ?? ""}
              onChange={(event) =>
                form.handleChange("confirmPassword", event.target.value)
              }
              onBlur={() => form.handleBlur("confirmPassword")}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="focus-visible:ring-brand-400 absolute inset-y-0 right-2 flex items-center text-neutral-500 transition hover:text-neutral-700 focus-visible:rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
              onClick={() => setConfirmPasswordVisible((prev) => !prev)}
              aria-pressed={confirmPasswordVisible}
              aria-label={
                confirmPasswordVisible
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              disabled={isSubmitting}
            >
              {confirmPasswordVisible ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only">
                {confirmPasswordVisible
                  ? "Hide confirm password"
                  : "Show confirm password"}
              </span>
            </button>
          </div>
          {confirmPasswordError ? (
            <p className="text-xs text-error-500">{confirmPasswordError}</p>
          ) : null}
        </div>
      ) : null}

      {serverError ? (
        <div className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700">
          {serverError}
        </div>
      ) : null}

      <button
        type="submit"
        className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-400 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-white transition focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Please wait..." : submitLabel}
      </button>

      {additionalActions ? (
        <div className="text-sm text-neutral-600">{additionalActions}</div>
      ) : null}
    </form>
  );
}
