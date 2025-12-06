import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Article } from "@api/articles.ts";
import { API_URL } from "@api/client.ts";
import { fetchFavorites, addFavorite, removeFavorite } from "@api/favorites.ts";
import { getUser } from "@utils/auth.ts";

export default function ArticleCard({ article }: { article: Article }): React.ReactElement {
  const imgUrl = article.coverImage?.url ? `${API_URL}${article.coverImage.url}` : null;
  const [favId, setFavId] = useState<number | null>(null);

  useEffect(() => {
    if (!getUser()) return;
    fetchFavorites().then((favs) => {
      const found = favs.find((f) => f.article.id === article.id);
      if (found) setFavId(found.id);
    });
  }, [article.id]);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    if (!getUser()) {
      alert("Нужно войти в систему");
      return;
    }
    if (favId) {
      await removeFavorite(favId);
      location.reload(); // обновляем страницу после удаления
    } else {
      await addFavorite(article.id!);
      location.reload(); // обновляем страницу после добавления
    }
  }

  return (
    <Link
      to={`/article/${article.slug}`}
      className="block rounded shadow hover:shadow-lg transition relative"
    >
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
          <button onClick={toggleFavorite} className="ml-2 text-red-500 text-xl">
            {favId ? "❤️" : "🤍"}
          </button>
        </h3>
        {article.excerpt && (
          <p className="text-sm text-gray-600 mt-2">{article.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
