import type { RouteObject } from "react-router";
import { DebtDetail } from "./DebtDetail";
import { DebtsList } from "./DebtsList";

export const debtsRoutes: RouteObject[] = [
  {
    path: "/debts",
    element: <DebtsList />,
  },
  {
    path: "/debts/:id",
    element: <DebtDetail />,
  },
];
