import { get, post, del } from "./client";
import type { Article, Paginated } from "./articles";

/**
 * Список избранного пользователя.
 * Если у тебя другой endpoint — поменяй путь.
 */
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

/**
 * Добавление статьи в избранное.
 * Ожидается, что бэкенд создаёт Favorite с relation на Article и текущего пользователя.
 */
export function addFavorite(articleId: number) {
  return post<{ id: number }>(`/api/favorites`, {
    data: { article: articleId },
  });
}

/**
 * Удаление избранного по его id.
 */
export function removeFavorite(favoriteId: number) {
  return del<void>(`/api/favorites/${favoriteId}`);
}
