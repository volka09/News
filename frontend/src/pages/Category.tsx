import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCategories, type Category } from "@api/categories.ts";
import { fetchArticles, type Article, type Paginated, type Media, type CategoryRef } from "@api/articles.ts";
import ArticleCard from "@components/ArticleCard.tsx";
import Skeleton from "@components/Skeleton.tsx";

const SafeSkeleton = Skeleton as unknown as React.FC<{ className?: string }>;
const SafeArticleCard = ArticleCard as unknown as React.FC<{ article: Article }>;

// безопасные геттеры
function getCategory(a: Article): CategoryRef | undefined {
  return typeof a.category === "object" ? a.category : undefined;
}
function getCoverImage(a: Article): Media | undefined {
  return typeof a.coverImage === "object" ? a.coverImage : undefined;
}

export default function Category(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [meta, setMeta] = useState<Paginated<Article>["meta"] | null>(null);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      try {
        const cats = await fetchCategories();
        const cat = cats.find((c) => c.slug === slug) ?? null;
        if (mounted) setCategory(cat);

        const resp = await fetchArticles({ "category.slug": slug! }, page);
        if (mounted) {
          setArticles(resp.data);
          setMeta(resp.meta);
          setError("");
        }
      } catch (e: unknown) {
        const message =
          typeof (e as { message?: unknown })?.message === "string"
            ? (e as { message: string }).message
            : "Не удалось загрузить";
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [slug, page]);

  function changePage(p: number) {
    if (!meta) return;
    const max = meta.pagination.pageCount;
    const next = Math.max(1, Math.min(p, max));
    setPage(next);
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SafeSkeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="rounded border bg-red-50 p-4 text-red-700">{error}</div>;
  }

  if (!category) {
    return <div className="text-gray-500">Категория не найдена.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{category.name}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.length > 0 ? (
          articles.map((a, i) => (
            <SafeArticleCard key={a.id ?? a.slug ?? i} article={a} />
          ))
        ) : (
          <div className="text-gray-500">Нет новостей в выбранной категории.</div>
        )}
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
    </div>
  );
}
