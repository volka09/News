import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Article, Media, CategoryRef, AuthorRef } from "@api/articles";
import { addFavorite, removeFavorite } from "@api/favorites";
import { API_URL } from "@api/client";

// безопасные геттеры
function getCoverImage(a: Article): Media | undefined {
  return typeof a.coverImage === "object" ? a.coverImage : undefined;
}
function getCategory(a: Article): CategoryRef | undefined {
  return typeof a.category === "object" ? a.category : undefined;
}
function getAuthor(a: Article): AuthorRef | undefined {
  return typeof a.Author === "object" ? a.Author : undefined;
}

export default function ArticleCard({ article }: { article: Article }) {
  const [favState, setFavState] = useState<{
    isFavorite: boolean;
    favoriteId?: number;
    busy: boolean;
    error?: string;
  }>({
    isFavorite: Boolean(article.isFavorite),
    favoriteId: article.favoriteId,
    busy: false,
  });

  const cover = getCoverImage(article);
  const category = getCategory(article);
  const author = getAuthor(article);

  const imgUrl = cover?.url ? `${API_URL}${cover.url}` : article.coverUrl ?? null;
  const href = article.slug ? `/article/${article.slug}` : "#";

  async function toggleFavorite() {
    if (favState.busy) return;
    setFavState((s) => ({ ...s, busy: true, error: undefined }));
    try {
      if (!favState.isFavorite) {
        const created = await addFavorite(article.id!);
        setFavState({ isFavorite: true, favoriteId: created.id, busy: false });
      } else if (favState.favoriteId) {
        await removeFavorite(favState.favoriteId);
        setFavState({ isFavorite: false, favoriteId: undefined, busy: false });
      } else {
        setFavState((s) => ({ ...s, busy: false }));
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Ошибка избранного";
      setFavState((s) => ({ ...s, error: msg, busy: false }));
    }
  }

  return (
    <article className="border rounded-lg overflow-hidden bg-white shadow-sm">
      {imgUrl && (
        <img
          src={imgUrl}
          alt={cover?.alternativeText ?? article.title}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold line-clamp-2">
          <Link to={href} className="hover:text-brand-500">
            {article.title}
          </Link>
        </h3>

        {article.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-3">{article.excerpt}</p>
        )}

        <div className="text-xs text-gray-500 flex items-center gap-2">
          {category?.name && <span>{category.name}</span>}
          {article.publishDate && (
            <span>· {new Date(article.publishDate).toLocaleDateString("ru-RU")}</span>
          )}
          {!article.publishDate && article.publishedAt && (
            <span>· {new Date(article.publishedAt).toLocaleDateString("ru-RU")}</span>
          )}
          {author?.username && <span>· {author.username}</span>}
        </div>

        <div className="flex items-center gap-2 pt-2">
          {typeof article.views === "number" && (
            <span className="text-xs text-gray-500">Просмотры: {article.views}</span>
          )}
          {typeof article.readingTime === "number" && (
            <span className="text-xs text-gray-500">
              · Время чтения: {article.readingTime} мин
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3">
          <Link
            to={href}
            className="px-3 py-1 text-sm rounded border hover:bg-gray-50"
          >
            Читать
          </Link>

          {article.id && (
            <button
              onClick={toggleFavorite}
              className={`px-3 py-1 text-sm rounded border ${
                favState.isFavorite
                  ? "border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                  : "hover:bg-gray-50"
              }`}
              disabled={favState.busy}
              title={favState.isFavorite ? "Убрать из избранного" : "В избранное"}
            >
              {favState.busy
                ? "..."
                : favState.isFavorite
                ? "★ В избранном"
                : "☆ В избранное"}
            </button>
          )}
        </div>

        {favState.error && (
          <div className="text-xs text-red-600 pt-1">{favState.error}</div>
        )}
      </div>
    </article>
  );
}
