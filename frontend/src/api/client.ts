const BASE_URL = import.meta.env.VITE_API_URL;

export type ApiError = { status: number; message: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) throw new Error("VITE_API_URL не задан в .env");
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw { status: res.status, message: text || res.statusText } as ApiError;
  }
  return res.json();
}

export const api = { request };
