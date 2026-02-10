import { apiRequest } from "../../lib/api-client";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "./types";

const AUTH_ENDPOINT = "/auth";

export function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(`${AUTH_ENDPOINT}/register`, {
    method: "POST",
    body: payload,
  });
}

export function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(`${AUTH_ENDPOINT}/login`, {
    method: "POST",
    body: payload,
  });
}
