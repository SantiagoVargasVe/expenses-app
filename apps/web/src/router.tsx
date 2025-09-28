import { createBrowserRouter } from "react-router";
import LandingPage from "./modules/landing/Landing";
import { authRoutes } from "./modules/auth/route";

export const router = createBrowserRouter([
  {
    path: "/",
    children: [{ index: true, element: <LandingPage /> }, authRoutes],
  },
]);
