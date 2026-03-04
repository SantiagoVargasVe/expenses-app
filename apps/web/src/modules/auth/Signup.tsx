import { Link, useNavigate } from "react-router";
import { AuthForm } from "./components/AuthForm";
import { AuthPageLayout } from "./components/AuthPageLayout";
import { useRegisterMutation } from "./hooks";
import { getFieldErrors } from "../../lib/api-errors";

export function Signup() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const serverFieldErrors = getFieldErrors(registerMutation.error);

  return (
    <AuthPageLayout
      title="Create your account"
      description="Sign up to start tracking your expenses and budgets."
      footer={
        <span>
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-brand-600 font-medium hover:underline"
          >
            Log in
          </Link>
        </span>
      }
    >
      <AuthForm
        submitLabel="Create account"
        mode="signup"
        isSubmitting={registerMutation.isPending}
        serverError={registerMutation.error?.message ?? null}
        serverFieldErrors={serverFieldErrors}
        passwordAutoComplete="new-password"
        onSubmit={async ({ email, password }) => {
          await registerMutation.mutateAsync({ email, password });
          navigate("/dashboard");
        }}
      />
    </AuthPageLayout>
  );
}
