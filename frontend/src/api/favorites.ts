import { apiFetch } from "./client";
import { Article, Paginated } from "./articles";

// export type Favorite = {
//   id: number;
//   article: { id: number; title: string; slug: string };
// };

// Получение избранных статей
export async function fetchFavorites(): Promise<Paginated<Article>> {
  return apiFetch<Paginated<Article>>("/api/favorites/user", { auth: true });
}

export async function addFavorite(articleId: number): Promise<{ isFavorite: boolean; favoriteId: number }> {
  return apiFetch<{ isFavorite: boolean; favoriteId: number }>("/api/favorites", {
    method: "POST",
    body: JSON.stringify({ data: { article: articleId } }),
    auth: true,
  });
}

export async function removeFavorite(favoriteId: number): Promise<{ isFavorite: boolean; favoriteId: number }> {
  return apiFetch<{ isFavorite: boolean; favoriteId: number }>(`/api/favorites/${favoriteId}`, {
    method: "DELETE",
    auth: true,
  });
}
