import { Link, useNavigate } from "react-router";
import { AuthForm } from "./components/AuthForm";
import { AuthPageLayout } from "./components/AuthPageLayout";
import { useRegisterMutation } from "./hooks";

export function Signup() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

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
        passwordAutoComplete="new-password"
        onSubmit={async ({ email, password }) => {
          await registerMutation.mutateAsync({ email, password });
          navigate("/");
        }}
      />
    </AuthPageLayout>
  );
}
