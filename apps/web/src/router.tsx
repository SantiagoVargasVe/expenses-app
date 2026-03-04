import { createBrowserRouter } from "react-router";
import { Home } from "./modules/app/Home";
import { AppLayout } from "./modules/app/AppLayout";
import { Dashboard } from "./modules/app/Dashboard";
import { authRoutes } from "./modules/auth/route";
import { RequireAuth } from "./modules/auth/RequireAuth";
import { accountsRoutes } from "./modules/accounts/route";
import { transactionsRoutes } from "./modules/transactions/route";
import { recurringRoutes } from "./modules/recurring/route";
import { peopleRoutes } from "./modules/people/route";
import { debtsRoutes } from "./modules/debts/route";

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, element: <Home /> },
      ...authRoutes,
      {
        element: (
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        ),
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          ...accountsRoutes,
          ...transactionsRoutes,
          ...recurringRoutes,
          ...peopleRoutes,
          ...debtsRoutes,
        ],
      },
    ],
  },
]);
