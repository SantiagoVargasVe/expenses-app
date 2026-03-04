import type { RouteObject } from "react-router";
import { PeopleList } from "./PeopleList";

export const peopleRoutes: RouteObject[] = [
  {
    path: "/people",
    element: <PeopleList />,
  },
];
