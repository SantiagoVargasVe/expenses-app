import { Navigate } from "react-router";
import { useAuthQuery } from "../auth/hooks";
import LandingPage from "../landing/Landing";

export function Home() {
  const { data: user, isLoading } = useAuthQuery();

  if (isLoading) {
    return (
      <div className="bg-neutral-50 flex min-h-screen items-center justify-center text-neutral-600">
        Checking session...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
}
