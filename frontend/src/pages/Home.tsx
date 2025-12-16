// src/pages/Home.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "@api/client.ts";
import { getUser } from "@utils/auth.ts";
import Skeleton from "@components/Skeleton.tsx";
import ArticleCard from "@components/ArticleCard.tsx";

/**
 * GPT5 — Главная страница с восстановленным фильтром избранных новостей:
 * - Блок "Избранные" (isFeatured = true) поверх общего списка.
 * - Общий список новостей ниже, с пагинацией.
 * - Ничего не трогаем в авторстве/relations, только фильтрация по isFeatured.
 * - Populate: coverImage и Author, чтобы карточки были полными.
 */

type RoleLike = { type?: string } | string | undefined;
type UserLike = {
  id: number;
  username: string;
  email?: string;
  role?: RoleLike;
  documentId?: string;
};

type Media = {
  id: number;
  documentId?: string;
  url?: string;
  name?: string;
  mime?: string;
  size?: number;
};

type AuthorRel = {
  id: number;
  documentId?: string;
  username?: string;
  email?: string;
};

type Article = {
  id: number;
  documentId?: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  slug?: string;
  isFeatured?: boolean | null;
  coverImage?: Media | number | null;
  Author?: AuthorRel | number | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
};

type ListMeta = { pagination?: { page?: number; pageSize?: number; pageCount?: number; total?: number } };
type ArticleListResponse = { data: Article[]; meta?: ListMeta };

const PAGE_SIZE = 12;

const SafeSkeleton = Skeleton as unknown as React.FC<{ className?: string }>;
const SafeArticleCard = ArticleCard as unknown as React.FC<{ article: Article }>;

function normalizeRole(role?: RoleLike): string {
  if (!role) return "";
  if (typeof role === "string") return role.toLowerCase();
  return (role.type ?? "").toLowerCase();
}

/** Избранные (isFeatured = true) */
async function fetchFeaturedArticles(): Promise<ArticleListResponse> {
  const params = new URLSearchParams();
  params.set("filters[isFeatured][$eq]", "true");
  params.set("pagination[page]", "1");
  params.set("pagination[pageSize]", String(PAGE_SIZE));
  params.set("sort[0]", "createdAt:desc");
  params.set("populate[coverImage]", "true");
  params.set("populate[Author]", "true");

  return apiFetch<ArticleListResponse>(`/api/articles?${params.toString()}`, { method: "GET" });
}

/** Все статьи (общая лента) */
async function fetchAllArticles(page: number): Promise<ArticleListResponse> {
  const params = new URLSearchParams();
  params.set("pagination[page]", String(page));
  params.set("pagination[pageSize]", String(PAGE_SIZE));
  params.set("sort[0]", "createdAt:desc");
  params.set("populate[coverImage]", "true");
  params.set("populate[Author]", "true");

  return apiFetch<ArticleListResponse>(`/api/articles?${params.toString()}`, { method: "GET" });
}

export default function Home(): React.ReactElement {
  const nav = useNavigate();

  const user = getUser<UserLike>();
  const roleType = useMemo(() => normalizeRole(user?.role), [user]);
  const isAuthor = roleType === "author";

  const [featured, setFeatured] = useState<Article[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [items, setItems] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<ArticleListResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    setFeaturedLoading(true);
    fetchFeaturedArticles()
      .then((resp) => {
        if (!mounted) return;
        setFeatured(resp?.data ?? []);
      })
      .catch((e) => {
        setError(`Ошибка загрузки избранных новостей: ${e instanceof Error ? e.message : String(e)}`);
      })
      .finally(() => mounted && setFeaturedLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchAllArticles(page)
      .then((resp) => {
        if (!mounted) return;
        setItems(resp?.data ?? []);
        setMeta(resp?.meta ?? null);
      })
      .catch((e) => {
        setError(`Ошибка загрузки новостей: ${e instanceof Error ? e.message : String(e)}`);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page]);

  function changePage(p: number) {
    const max = meta?.pagination?.pageCount ?? 1;
    const next = Math.max(1, Math.min(p, max));
    setPage(next);
  }

  return (
    <section className="space-y-10">
      {/* Хедер */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Новости</h1>
        <div className="flex items-center gap-3">
          {isAuthor && (
            <Link to="/author" className="text-sm text-gray-700 hover:text-brand-600 underline underline-offset-2">
              Панель автора
            </Link>
          )}
          <button onClick={() => nav(0)} className="text-sm px-3 py-1 rounded border hover:bg-gray-50" title="Обновить">
            Обновить
          </button>
        </div>
      </div>

      {/* Блок избранных */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Избранные</h2>
          <Link
            to="/featured"
            className="text-sm text-gray-700 hover:text-brand-600 underline underline-offset-2"
            title="Все избранные"
          >
            Все избранные
          </Link>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: Math.min(PAGE_SIZE, 6) }).map((_, i) => (
              <SafeSkeleton key={i} className="h-64" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-gray-600">Пока нет избранных новостей.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((a, i) => (
              <div key={a.id ?? a.slug ?? i} className="space-y-2">
                <SafeArticleCard article={a} />
                <div className="flex items-center gap-2">
                  {a.slug ? (
                    <Link to={`/news/${a.slug}`} className="px-3 py-1 text-sm rounded border hover:bg-gray-50">
                      Читать
                    </Link>
                  ) : a.id ? (
                    <Link to={`/news/${a.id}`} className="px-3 py-1 text-sm rounded border hover:bg-gray-50">
                      Читать
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Общая лента */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Последние</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SafeSkeleton key={i} className="h-64" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 border rounded p-3">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600">Новостей пока нет.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((a, i) => (
                <div key={a.id ?? a.slug ?? i} className="space-y-2">
                  <SafeArticleCard article={a} />
                  <div className="flex items-center gap-2">
                    {a.slug ? (
                      <Link to={`/news/${a.slug}`} className="px-3 py-1 text-sm rounded border hover:bg-gray-50">
                        Читать
                      </Link>
                    ) : a.id ? (
                      <Link to={`/news/${a.id}`} className="px-3 py-1 text-sm rounded border hover:bg-gray-50">
                        Читать
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {meta?.pagination?.pageCount && meta.pagination.pageCount > 1 && (
              <nav className="flex items-center justify-center gap-2 mt-6">
                <button className="px-3 py-1 rounded border" onClick={() => changePage(page - 1)} disabled={page === 1}>
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
      </div>
    </section>
  );
}
