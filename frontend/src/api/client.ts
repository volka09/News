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

  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = "Request failed";
    try {
      const json = JSON.parse(text);
      msg = json?.error?.message ?? json?.message ?? msg;
    } catch {
      msg = text || msg;
    }
    throw new Error(msg);
  }
  return res.json();
}
