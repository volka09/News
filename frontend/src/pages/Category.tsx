import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCategories, type Category } from "@api/categories.ts";
import { fetchArticles, type Article } from "@api/articles.ts";
import ArticleCard from "@components/ArticleCard.tsx";
import Skeleton from "@components/Skeleton.tsx";

const SafeSkeleton = Skeleton as unknown as React.FC<{ className?: string }>;
const SafeArticleCard = ArticleCard as unknown as React.FC<{ article: Article }>;

export default function Category(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
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

        const all = await fetchArticles();
        if (mounted) setArticles(all.filter((a) => a.category?.slug === slug));

        if (mounted) setError("");
      } catch (e: unknown) {
        const message =
          typeof (e as { message?: unknown })?.message === "string"
            ? (e as { message: string }).message
            : "Failed to load";
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [slug]);

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
    return (
      <div className="rounded border bg-red-50 p-4 text-red-700">{error}</div>
    );
  }

  if (!category) {
    return <div className="text-gray-500">Category not found.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{category.name}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.length > 0 ? (
          articles.map((a) => (
            <SafeArticleCard key={a.id ?? a.slug ?? Math.random()} article={a} />
          ))
        ) : (
          <div className="text-gray-500">Нет новостей в выбранной категории.</div>
        )}
      </div>
    </div>
  );
}
