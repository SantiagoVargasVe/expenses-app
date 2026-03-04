import type { RouteObject } from "react-router";
import { CreateRecurring } from "./CreateRecurring";
import { RecurringList } from "./RecurringList";

export const recurringRoutes: RouteObject[] = [
  {
    path: "/recurring",
    element: <RecurringList />,
  },
  {
    path: "/recurring/new",
    element: <CreateRecurring />,
  },
];
