import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchArticle, type Article } from "@api/articles.ts";
import { formatDate } from "@utils/format.ts";
import Skeleton from "@components/Skeleton.tsx";

const SafeSkeleton = Skeleton as unknown as React.FC<{ className?: string }>;

export default function Article(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!slug) {
      setError("Invalid article slug");
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    fetchArticle(slug)
      .then((a: Article) => {
        if (mounted) setItem(a);
      })
      .catch((e: unknown) => {
        const message =
          typeof (e as { message?: unknown })?.message === "string"
            ? (e as { message: string }).message
            : "Failed to load";
        if (mounted) setError(message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return <SafeSkeleton className="h-64" />;
  }

  if (error) {
    return (
      <div className="rounded border bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!item) {
    return <div className="text-gray-500">Article not found.</div>;
  }

  return (
    <article className="prose max-w-none">
      <h1>{item.title}</h1>
      {item.publishDate && (
        <p className="text-sm text-gray-500">{formatDate(item.publishDate)}</p>
      )}
      {item.coverImage?.url && (
        <img
          src={item.coverImage.url}
          alt={item.title}
          className="my-4 rounded"
        />
      )}
      <div className="text-sm text-gray-600">
        {item.category?.name
          ? `Категория: ${item.category.name}`
          : "Category not found."}
      </div>
      <div className="whitespace-pre-wrap">{item.content}</div>
    </article>
  );
}
