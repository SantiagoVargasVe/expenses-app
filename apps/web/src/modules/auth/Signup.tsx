import { Form, Link, useNavigation } from "react-router";
import { Input } from "../shared/ui/Input";
import { Button } from "../shared/ui/Button";
import { Spinner } from "../shared/ui/Spinner";

export function Signup() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-heading-1 font-heading-1 text-brand-600 mb-2">
          Create your account
        </h1>
        <p className="text-body text-subtext-color mb-6">
          Start managing your expenses today
        </p>

        <Form method="post" className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="text-body-bold mb-1 block text-neutral-700"
            >
              Full name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              className="w-full"
            />
          </div>

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
              className="w-full"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" /> : "Sign up"}
          </Button>
        </Form>

        <p className="text-body text-subtext-color mt-6 text-center">
          Already have an account?{" "}
          <Link
            to="../login"
            className="text-brand-600 focus:ring-brand-500 hover:underline focus:ring-2 focus:outline-none"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
