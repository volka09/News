// src/pages/FeaturedPage.tsx
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
    coverImage?: { data?: unknown };
    category?: { data?: unknown };
    Author?: { data?: unknown };
    [key: string]: unknown;
  };
};

type FavoriteItem = {
  id: number;
  attributes: {
    article?: {
      data?: ArticleRel | null;
    };
    user?: {
      data?: { id: number } | null;
    };
  };
};

type FavoritesResp = { data: FavoriteItem[] };

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

    const qs = new URLSearchParams({
      "pagination[page]": "1",
      "pagination[pageSize]": "12",
    });
    qs.set("filters[user][id][$eq]", String(user.id));
    qs.append("populate[article]", "true");
    qs.append("populate[article][coverImage]", "true");
    qs.append("populate[article][category]", "true");
    qs.append("populate[article][Author]", "true");

    apiFetch<FavoritesResp>(`/api/favorite?${qs.toString()}`, { method: "GET" })
      .then((resp) => {
        if (!mounted) return;
        const favorites = Array.isArray(resp?.data) ? resp.data : [];
        const articles =
          favorites
            .map((fav) => fav.attributes.article?.data || null)
            .filter((a): a is ArticleRel => !!a && typeof a.id === "number") ?? [];
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
                } as any}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
