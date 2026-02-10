export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "user" | "admin";
}

export interface AuthResponse {
  user: AuthenticatedUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role?: AuthenticatedUser["role"];
}

export interface LoginPayload {
  email: string;
  password: string;
}
