import React, { useEffect, useState } from "react";
import { fetchLatestArticles, type Article, type Paginated } from "@api/articles.ts";
import { fetchFavorites } from "@api/favorites.ts";
import Skeleton from "@components/Skeleton.tsx";
import ArticleCard from "@components/ArticleCard.tsx";
import { getUser } from "@utils/auth.ts";

export default function Home(): React.ReactElement {
  const [items, setItems] = useState<Article[]>([]);
  const [meta, setMeta] = useState<Paginated<Article>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    if (favoritesOnly && Boolean(getUser())) {
      fetchFavorites()
        .then((favs) => {
          setItems(favs.map((f) => f.article as Article));
          setMeta(null);
          setError("");
        })
        .catch(() => setError("Не удалось загрузить избранное"))
        .finally(() => setLoading(false));
    } else {
      fetchLatestArticles(page)
        .then((r) => {
          setItems(r.data);
          setMeta(r.meta);
          setError("");
        })
        .catch(() => setError("Не удалось загрузить новости"))
        .finally(() => setLoading(false));
    }
  }, [page, favoritesOnly]);

  function changePage(p: number) {
    if (!meta) return;
    const max = meta.pagination.pageCount;
    const next = Math.max(1, Math.min(p, max));
    setPage(next);
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Последние новости</h2>
        {Boolean(getUser()) && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
            />
            Только избранные
          </label>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500">Пока нет новостей.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((a) => (
              <ArticleCard key={a.documentId ?? a.id ?? a.slug ?? Math.random()} article={a} />
            ))}
          </div>

          {meta && meta.pagination.pageCount > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-6">
              <button
                className="px-3 py-1 rounded border"
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
              >
                Назад
              </button>
              <span className="px-2 text-sm">
                Страница {page} из {meta.pagination.pageCount}
              </span>
              <button
                className="px-3 py-1 rounded border"
                onClick={() => changePage(page + 1)}
                disabled={page >= meta.pagination.pageCount}
              >
                Вперёд
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
