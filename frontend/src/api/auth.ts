import { API_URL } from "./client"; // предполагается, что client.ts экспортирует API_URL
type Credentials = { identifier: string; password: string };
type RegisterPayload = { username: string; email: string; password: string };

export type AuthUser = {
  id: number;
  username: string;
  email: string;
};

export type AuthResponse = {
  jwt: string;
  user: AuthUser;
};

export async function login(payload: Credentials): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "Ошибка авторизации");
  }
  return res.json();
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/local/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "Ошибка регистрации");
  }
  return res.json();
}
