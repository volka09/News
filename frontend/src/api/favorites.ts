import { apiFetch } from "./client";

export type Favorite = {
  id: number;
  article: { id: number; title: string; slug: string };
};

export async function fetchFavorites(): Promise<Favorite[]> {
  const res = await apiFetch<{ data: Favorite[] }>("/api/favorites?populate=article", {
    auth: true,
  });
  return res.data;
}

export async function addFavorite(articleId: number): Promise<Favorite> {
  return apiFetch<Favorite>("/api/favorites", {
    method: "POST",
    body: JSON.stringify({ data: { article: articleId } }),
    auth: true,
  });
}

export async function removeFavorite(favId: number): Promise<void> {
  await apiFetch<void>(`/api/favorites/${favId}`, {
    method: "DELETE",
    auth: true,
  });
}
