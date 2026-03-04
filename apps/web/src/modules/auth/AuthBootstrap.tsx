import { useAuthQuery } from "./hooks";

export function AuthBootstrap() {
  useAuthQuery();
  return null;
}
