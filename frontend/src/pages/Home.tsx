import React, { useEffect, useState } from "react";
import { fetchLatestArticles, type Article } from "@api/articles.ts";
import Skeleton from "@components/Skeleton.tsx";
import ArticleCard from "@components/ArticleCard.tsx";

export default function Home(): React.ReactElement {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLatestArticles()
      .then((arr) => setItems(arr))
      .catch(() => setError("Не удалось загрузить новости"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold">Последние новости</h2>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((a) => (
            <ArticleCard key={a.documentId ?? a.id ?? a.slug ?? Math.random()} article={a} />
          ))}
        </div>
      )}
    </section>
  );
}
