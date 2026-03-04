import type { RouteObject } from "react-router";
import { AccountDetail } from "./AccountDetail";
import { AccountsList } from "./AccountsList";
import { CreateCreditCard } from "./CreateCreditCard";

export const accountsRoutes: RouteObject[] = [
  {
    path: "/accounts",
    element: <AccountsList />,
  },
  {
    path: "/accounts/new",
    element: <CreateCreditCard />,
  },
  {
    path: "/accounts/:id",
    element: <AccountDetail />,
  },
];
