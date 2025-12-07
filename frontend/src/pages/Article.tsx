import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchArticle, deleteArticle, type Article } from "@api/articles.ts";
import { formatDate } from "@utils/format.ts";
import { getRole } from "@utils/auth.ts";
import Skeleton from "@components/Skeleton.tsx";
import { API_URL } from "@api/client.ts";

const SafeSkeleton = Skeleton as unknown as React.FC<{ className?: string }>;

export default function Article(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();
  const nav = useNavigate();
  const [item, setItem] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const role = getRole();

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
        if (mounted) setItem(a ?? null);
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

  async function onDelete() {
    if (!item?.id) return;
    if (!confirm("Удалить эту новость?")) return;
    try {
      await deleteArticle(item.id);
      nav("/");
    } catch (e) {
      const message =
        typeof (e as { message?: unknown })?.message === "string"
          ? (e as { message: string }).message
          : "Не удалось удалить";
      setError(message);
    }
  }

  if (loading) {
    return <SafeSkeleton className="h-64" />;
  }

  if (error) {
    return (
      <div className="rounded border bg-red-50 p-4 text-red-700">{error}</div>
    );
  }

  if (!item) {
    return <div className="text-gray-500">Article not found.</div>;
  }

  const imgUrl = item.coverImage?.url ? `${API_URL}${item.coverImage.url}` : null;

  return (
    <article className="prose max-w-none">
      <div className="flex items-start justify-between gap-4">
        <h1>{item.title}</h1>
        {role === "editor" && item.id && (
          <button
            onClick={onDelete}
            className="bg-red-600 text-white rounded px-3 py-1 text-sm"
          >
            Удалить
          </button>
        )}
      </div>

      {(item.publishedAt || item.publishDate) && (
        <p className="text-sm text-gray-500">
          {formatDate(item.publishedAt ?? item.publishDate!)}
        </p>
      )}

      {imgUrl && (
        <img src={imgUrl} alt={item.title} className="my-4 rounded" />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 my-2">
        <div>
          {item.category?.name
            ? `Категория: ${item.category.name}`
            : "Категория не указана"}
        </div>
        <div>
          {item.Author?.username
            ? `Автор: ${item.Author?.username}`
            : "Автор не указан"}
        </div>
        <div>
          {Array.isArray(item.tags) && item.tags.length
            ? `Теги: ${item.tags.join(", ")}`
            : "Теги не указаны"}
        </div>
        <div>
          {typeof item.readingTime === "number"
            ? `Время чтения: ${item.readingTime} мин`
            : ""}
        </div>
        <div>
          {typeof item.views === "number" ? `Просмотры: ${item.views}` : ""}
        </div>
      </div>

      {item.excerpt && <p className="text-gray-700">{item.excerpt}</p>}

      <div className="whitespace-pre-wrap">{item.content}</div>
    </article>
  );
}
