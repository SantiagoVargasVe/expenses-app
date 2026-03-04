import type { RouteObject } from "react-router";
import { CreateTransaction } from "./CreateTransaction";
import { TransactionsList } from "./TransactionsList";

export const transactionsRoutes: RouteObject[] = [
  {
    path: "/transactions",
    element: <TransactionsList />,
  },
  {
    path: "/transactions/new",
    element: <CreateTransaction />,
  },
];
