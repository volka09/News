import React, { useEffect, useState } from "react";
import Skeleton from "@components/Skeleton.tsx";
import ArticleCard from "@components/ArticleCard.tsx";
import { getUser } from "@utils/auth.ts";
import { apiFetch } from "@api/client.ts";

type ArticleRel = {
  id: number;
  attributes: {
    slug?: string;
    title?: string;
    coverImage?: unknown;
    category?: unknown;
    Author?: unknown;
    isFavorite?: boolean;
    favoriteId?: number;
    [key: string]: unknown;
  };
};

type FavoritesResp = { data: ArticleRel[] };

export default function FeaturedPage(): React.ReactElement {
  const user = getUser<{ id?: number }>();
  const [items, setItems] = useState<ArticleRel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    if (!user?.id) {
      setItems([]);
      setLoading(false);
      setError("Не авторизован");
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    setError("");

    apiFetch<FavoritesResp>(`/api/favorites/user`, { method: "GET" })
      .then((resp) => {
        if (!mounted) return;
        const favorites = Array.isArray(resp?.data) ? resp.data : [];
        const articles = favorites.filter((a) => !!a && typeof a.id === "number");
        setItems(articles);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Мои избранные статьи</h1>

      {error && <div className="bg-red-50 text-red-700 border rounded p-3">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-gray-600">Избранных статей пока нет.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((a) => (
            <div key={a.id} className="space-y-2">
              <ArticleCard
                article={{
                  id: a.id,
                  slug: a.attributes.slug,
                  title: a.attributes.title,
                  coverImage: a.attributes.coverImage,
                  category: a.attributes.category,
                  Author: a.attributes.Author,
                  isFavorite: a.attributes.isFavorite,
                  favoriteId: a.attributes.favoriteId,
                } as any}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}