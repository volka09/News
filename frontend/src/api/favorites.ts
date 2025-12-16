import { get, post, del } from "./client";
import type { Article, Paginated } from "./articles";

export function fetchFavorites(page = 1, pageSize = 9) {
  const qs = new URLSearchParams({
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
  });
  qs.append("populate[coverImage]", "*");
  qs.append("populate[category]", "*");
  qs.append("populate[Author]", "*");

  return get<Paginated<Article>>(`/api/favorites?${qs.toString()}`);
}

export function addFavorite(articleId: number) {
  return post<{ id: number }>(`/api/favorites`, {
    data: { article: articleId },
  });
}

export function removeFavorite(favoriteId: number) {
  return del<void>(`/api/favorites/${favoriteId}`);
}
