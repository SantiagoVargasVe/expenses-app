import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";

import "./index.css";
import { router } from "./router";
import { AuthBootstrap } from "./modules/auth/AuthBootstrap";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
