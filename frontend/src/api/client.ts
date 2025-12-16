export const API_URL = import.meta.env.VITE_API_URL;

/** Берёт JWT из локального стора, если сохранён через saveAuth */
function getJwt(): string | null {
  try {
    const raw = localStorage.getItem("auth:user") || sessionStorage.getItem("auth:user");
    if (!raw) return null;
    const obj = JSON.parse(raw) as { jwt?: string };
    return obj?.jwt ?? null;
  } catch {
    return null;
  }
}

export function withAuthHeaders(extra?: Record<string, string>) {
  const jwt = getJwt();
  return {
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    ...(extra ?? {}),
  };
}

// Универсальная обёртка, которая уже используется в Login.tsx
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...withAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Удобные методы для типизированных вызовов
export const get = async <T>(path: string) =>
  apiFetch<T>(path, { method: "GET" });

export const post = async <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });

export const put = async <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) });

export const del = async <T>(path: string) =>
  apiFetch<T>(path, { method: "DELETE" });
