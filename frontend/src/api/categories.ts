import { apiFetch } from "./client";
export type Category = { id: number; name: string; slug: string };

export async function fetchCategories(): Promise<Category[]> {
  const r = await apiFetch<{ data: Category[] }>("/api/categories?fields=name,slug");
  return r.data;
}
