export type Role = "public" | "authenticated" | "author" | "editor" | "admin";

const KEY = "auth:user";

type StoredUser = {
  id: number;
  username: string;
  email?: string;
  role?: { type?: string; name?: string } | Role;
  jwt?: string;
};

function normalizeRole(input?: unknown): Role {
  // Приводим строку из Strapi к нашему типу Role
  const v = typeof input === "string" ? input.toLowerCase() : undefined;
  if (v === "public") return "public";
  if (v === "authenticated") return "authenticated";
  if (v === "author") return "author";
  if (v === "editor") return "editor";
  if (v === "admin") return "admin";
  // Значение по умолчанию для залогиненных пользователей
  return "authenticated";
}

export function saveAuth(jwt: string, role: Role | string, user: Omit<StoredUser, "jwt">) {
  const normalized: Role = normalizeRole(role);
  const payload: StoredUser = {
    ...user,
    jwt,
    role: normalized,
  };
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function getUser<T = StoredUser>(): T | null {
  try {
    const raw = localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function getRole(): Role | null {
  const u = getUser<StoredUser>();
  // Если role — объект от Strapi, попробуем вытащить type
  if (!u) return null;
  if (typeof u.role === "string") return normalizeRole(u.role);
  const type = (u.role as { type?: string } | undefined)?.type;
  return normalizeRole(type);
}

export function clearAuth(): void {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}
