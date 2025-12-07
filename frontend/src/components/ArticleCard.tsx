import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Article } from "@api/articles.ts";
import { API_URL } from "@api/client.ts";
import { addFavorite, removeFavorite } from "@api/favorites.ts";
import { getUser } from "@utils/auth.ts";

type Props = { article: Article };

export default function ArticleCard({ article }: Props): React.ReactElement {
  const imgUrl = article.coverImage?.url ? `${API_URL}${article.coverImage.url}` : null;

  const [isFavorite, setIsFavorite] = useState<boolean>(Boolean(article.isFavorite));
  const [favoriteId, setFavoriteId] = useState<number | undefined>(article.favoriteId);
  const [loadingFav, setLoadingFav] = useState(false);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    if (!getUser()) {
      alert("Нужно войти в систему");
      return;
    }
    setLoadingFav(true);
    try {
      if (isFavorite && favoriteId) {
        const result = await removeFavorite(favoriteId);
        setIsFavorite(result.isFavorite);
        setFavoriteId(undefined);
      } else {
        const result = await addFavorite(article.id!);
        setIsFavorite(result.isFavorite);
        setFavoriteId(result.favoriteId);
      }
    } catch (error) {
      console.error("Ошибка при обновлении избранного:", error);
    } finally {
      setLoadingFav(false);
    }
  }

  return (
    <Link to={`/article/${article.slug}`} className="block rounded shadow hover:shadow-lg transition relative">
      {imgUrl && (
        <img
          src={imgUrl}
          alt={article.coverImage?.alternativeText ?? article.title}
          className="w-full h-48 object-cover rounded-t"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-bold flex items-center justify-between">
          {article.title}
          <button
            onClick={toggleFavorite}
            disabled={loadingFav}
            className={`ml-2 text-xl transition ${isFavorite ? "text-red-500" : "text-gray-400"}`}
            title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        </h3>

        {article.excerpt && <p className="text-sm text-gray-600 mt-2">{article.excerpt}</p>}

        <div className="mt-2 text-xs text-gray-500 space-y-1">
          {article.category?.name && <div>Категория: {article.category.name}</div>}
          {article.Author?.username && <div>Автор: {article.Author.username}</div>}
          {typeof article.views === "number" && <div>Просмотры: {article.views}</div>}
        </div>
      </div>
    </Link>
  );
}