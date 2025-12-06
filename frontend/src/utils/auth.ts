export type Role = "public" | "authenticated" | "editor";

const TOKEN_KEY = "jwt";
const ROLE_KEY = "role";
const USER_KEY = "user";

export function saveAuth(jwt: string, role: Role, user: unknown): void {
  sessionStorage.setItem(TOKEN_KEY, jwt);
  sessionStorage.setItem(ROLE_KEY, role);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getRole(): Role {
  return (sessionStorage.getItem(ROLE_KEY) as Role) ?? "public";
}

export function getUser<T = unknown>(): T | null {
  const raw = sessionStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function clearAuth(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(USER_KEY);
}
