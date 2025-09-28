import { Form, Link, useNavigation } from "react-router";
import { Input } from "../shared/ui/Input";
import { Button } from "../shared/ui/Button";
import { Spinner } from "../shared/ui/Spinner";

export function Login() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-heading-1 font-heading-1 text-brand-600 mb-2">
          Welcome back
        </h1>
        <p className="text-body text-subtext-color mb-6">
          Log in to continue tracking your expenses
        </p>

        <Form method="post" className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="text-body-bold mb-1 block text-neutral-700"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-body-bold mb-1 block text-neutral-700"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" /> : "Log in"}
          </Button>
        </Form>

        <p className="text-body text-subtext-color mt-6 text-center">
          Don’t have an account?{" "}
          <Link
            to="../signup"
            className="text-brand-600 focus:ring-brand-500 hover:underline focus:ring-2 focus:outline-none"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
