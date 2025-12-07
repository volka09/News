const base = import.meta.env.VITE_API_URL ?? "http://localhost:1337";
export const API_URL = base;

type FetchOptions = RequestInit & { auth?: boolean };

function authHeader(): Record<string, string> {
  const token = sessionStorage.getItem("jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(opts.headers ?? {}),
    ...(opts.auth ? authHeader() : {}),
  };

  const { auth, ...rest } = opts;

  const res = await fetch(url, { ...rest, headers });
  const raw = await res.text().catch(() => "");

  if (!res.ok) {
    let msg = raw || "Request failed";
    try {
      const json = JSON.parse(raw);
      msg = json?.error?.message ?? json?.message ?? msg;
    } catch {}
    throw new Error(`${res.status} ${res.statusText} ${rest.method ?? "GET"} ${url} → ${msg}`);
  }

  if (!raw) return {} as T;
  return JSON.parse(raw);
}
