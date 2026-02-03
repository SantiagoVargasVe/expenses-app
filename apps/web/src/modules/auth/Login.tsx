import { Link, useNavigate } from "react-router";
import { AuthForm } from "./components/AuthForm";
import { AuthPageLayout } from "./components/AuthPageLayout";
import { useLoginMutation } from "./hooks";

export function Login() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  return (
    <AuthPageLayout
      title="Welcome back"
      description="Log in with your email and password to access your dashboard."
      footer={
        <span>
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-brand-600 font-medium hover:underline"
          >
            Create one now
          </Link>
        </span>
      }
    >
      <AuthForm
        submitLabel="Log in"
        mode="login"
        isSubmitting={loginMutation.isPending}
        serverError={loginMutation.error?.message ?? null}
        onSubmit={async (values) => {
          await loginMutation.mutateAsync(values);
          navigate("/");
        }}
      />
    </AuthPageLayout>
  );
}
