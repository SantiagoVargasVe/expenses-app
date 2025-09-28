import type { RouteObject } from "react-router";
import { Login } from "./Login";
import { Signup } from "./Signup";

export const authRoutes: RouteObject = {
  path: "auth",
  children: [
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "signup",
      element: <Signup />,
    },
  ],
};
