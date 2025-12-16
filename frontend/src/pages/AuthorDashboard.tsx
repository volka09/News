// src/pages/AuthorDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "@api/client.ts";
import { getUser } from "@utils/auth.ts";
import Skeleton from "@components/Skeleton.tsx";
import ArticleCard from "@components/ArticleCard.tsx";

/**
 * GPT5 — Полный компонент панели автора (авторство проставляется СЕРВЕРОМ из JWT):
 * - Создание статьи: фронт НЕ передаёт поле автора вообще. Сервер (lifecycle/policy) ставит автора сам.
 * - GET: фильтр и populate по связи "Author" (с заглавной буквы) — подтверждено, работает.
 * - Медиа: coverImage передаём числовым id (после Upload).
 * - Slug: генерируем транслитом в латиницу и нормализуем.
 * - Красная панель: подробная отладка каждого шага.
 * - Пагинация, удаление, список статей автора.
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
  Author?: AuthorRel | number | null; // связь в ответах: "Author"
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
};

type ListMeta = { pagination?: { page?: number; pageSize?: number; pageCount?: number; total?: number } };
type ArticleListResponse = { data: Article[]; meta?: ListMeta };

type DebugInfo = {
  when: string;
  url: string;
  method: string;
  status?: number;
  requestParams?: Record<string, unknown>;
  responseJson?: unknown;
  note?: string;
};

const PAGE_SIZE = 9;

const SafeSkeleton = Skeleton as unknown as React.FC<{ className?: string }>;
const SafeArticleCard = ArticleCard as unknown as React.FC<{ article: Article }>;

/** JWT берём из хранилища (Upload требует явный заголовок, если apiFetch его не добавляет автоматически) */
function getJwt(): string | null {
  try {
    const raw = localStorage.getItem("auth:user") || sessionStorage.getItem("auth:user");
    if (!raw) return null;
    const obj = JSON.parse(raw) as { jwt?: string };
    return obj?.jwt ?? null;
  } catch {
    return null;
  }
}

/** Upload: возвращает id загруженного медиа */
async function uploadImage(file: File): Promise<number | undefined> {
  const API_URL = import.meta.env.VITE_API_URL;
  const jwt = getJwt();

  const form = new FormData();
  form.append("files", file);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }
  const data = (await res.json()) as Array<{ id: number }>;
  return Array.isArray(data) && data.length ? data[0].id : undefined;
}

/** GET: статьи по Author.id */
async function fetchArticlesByAuthor(authorId: number, page: number): Promise<ArticleListResponse> {
  const params = new URLSearchParams();
  params.set("filters[Author][id][$eq]", String(authorId));
  params.set("pagination[page]", String(page));
  params.set("pagination[pageSize]", String(PAGE_SIZE));
  params.set("populate[coverImage]", "true");
  params.set("populate[Author]", "true");

  return apiFetch<ArticleListResponse>(`/api/articles?${params.toString()}`, { method: "GET" });
}

/** GET: все статьи (fallback) */
async function fetchAllArticles(): Promise<ArticleListResponse> {
  const params = new URLSearchParams();
  params.set("pagination[page]", "1");
  params.set("pagination[pageSize]", String(PAGE_SIZE));
  params.set("populate[coverImage]", "true");
  params.set("populate[Author]", "true");
  return apiFetch<ArticleListResponse>(`/api/articles?${params.toString()}`, { method: "GET" });
}

/** POST: создать статью (БЕЗ автора — сервер сам проставит автора из JWT) */
async function createArticle(payload: Record<string, unknown>): Promise<{ data: Article }> {
  const body = JSON.stringify({ data: payload });
  return apiFetch<{ data: Article }>(`/api/articles`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  });
}

/** DELETE: удалить статью */
async function deleteArticle(id: number): Promise<void> {
  await apiFetch(`/api/articles/${id}`, { method: "DELETE" });
}

/** нормализация роли */
function normalizeRole(role?: RoleLike): string {
  if (!role) return "";
  if (typeof role === "string") return role.toLowerCase();
  return (role.type ?? "").toLowerCase();
}

/** формат отладки */
function formatDebug(info: DebugInfo | null): string | null {
  if (!info) return null;
  const lines = [
    `Время: ${info.when}`,
    `Запрос: ${info.method} ${info.url}`,
    info.status !== undefined ? `Статус: ${info.status}` : undefined,
    info.requestParams ? `Параметры: ${JSON.stringify(info.requestParams, null, 2)}` : undefined,
    info.responseJson ? `Ответ JSON: ${JSON.stringify(info.responseJson, null, 2)}` : undefined,
    info.note ? `Примечание: ${info.note}` : undefined,
  ].filter(Boolean) as string[];
  return lines.join("\n");
}

/** транслит кириллицы → латиница для slug, затем нормализация */
function slugify(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  const lower = input.toLowerCase();
  const translit = Array.from(lower)
    .map((ch) => (map[ch] !== undefined ? map[ch] : ch))
    .join("");
  return translit
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

export default function AuthorDashboard(): React.ReactElement {
  const nav = useNavigate();

  const user = getUser<UserLike>();
  const userId = user?.id ?? null;
  const roleType = useMemo(() => normalizeRole(user?.role), [user]);
  const isAuthor = roleType === "author";

  const [items, setItems] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<ArticleListResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string>("");
  const [debug, setDebug] = useState<DebugInfo | null>(null);

  const [form, setForm] = useState<{
    title: string;
    excerpt?: string;
    content: string;
    isFeatured?: boolean;
    coverFile?: File | null;
  }>({
    title: "",
    excerpt: "",
    content: "",
    isFeatured: false,
    coverFile: null,
  });
  const [submitting, setSubmitting] = useState(false);

  /** загрузка статей текущего автора */
  useEffect(() => {
    if (!isAuthor || !userId) return;

    let mounted = true;
    setLoading(true);
    setError("");
    setDebug(null);

    const urlParams = new URLSearchParams();
    urlParams.set("filters[Author][id][$eq]", String(userId));
    urlParams.set("pagination[page]", String(page));
    urlParams.set("pagination[pageSize]", String(PAGE_SIZE));
    urlParams.set("populate[coverImage]", "true");
    urlParams.set("populate[Author]", "true");
    const url = `/api/articles?${urlParams.toString()}`;

    fetchArticlesByAuthor(userId, page)
      .then((resp) => {
        if (!mounted) return;
        const data = resp?.data ?? [];
        setItems(data);
        setMeta(resp?.meta ?? null);

        setDebug({
          when: new Date().toISOString(),
          url,
          method: "GET",
          requestParams: {
            filters: { Author: { id: { $eq: String(userId) } } },
            pagination: { page, pageSize: PAGE_SIZE },
            populate: { coverImage: true, Author: true },
          },
          responseJson: resp,
          note: data.length === 0 ? "data пусто — проверим fallback" : "data содержит записи",
        });

        if (data.length === 0) {
          fetchAllArticles()
            .then((all) => {
              setDebug({
                when: new Date().toISOString(),
                url: `/api/articles?pagination[page]=1&pagination[pageSize]=${PAGE_SIZE}&populate[coverImage]=true&populate[Author]=true`,
                method: "GET",
                requestParams: {
                  filters: "none",
                  pagination: { page: 1, pageSize: PAGE_SIZE },
                  populate: { coverImage: true, Author: true },
                },
                responseJson: all,
                note:
                  (all.data?.length ?? 0) > 0
                    ? "Fallback вернул статьи — проверьте привязку Author у ваших записей"
                    : "Fallback пуст — статей нет или нет прав find",
              });
            })
            .catch((e) => setError(`Ошибка fallback-запроса: ${e instanceof Error ? e.message : String(e)}`));
        }
      })
      .catch((e) => {
        setError(`Ошибка запроса статей автора: ${e instanceof Error ? e.message : String(e)}`);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [isAuthor, userId, page]);

  function changePage(p: number) {
    const max = meta?.pagination?.pageCount ?? 1;
    const next = Math.max(1, Math.min(p, max));
    setPage(next);
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить эту новость полностью?")) return;
    try {
      await deleteArticle(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить статью");
    }
  }

  /** создание статьи (автор проставляется СЕРВЕРОМ — фронт автора не передаёт) */
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      setError("Не удалось определить текущего пользователя");
      return;
    }
    setSubmitting(true);
    setError("");
    setDebug(null);

    try {
      // 1) Upload (необязателен)
      let coverImageId: number | undefined;
      if (form.coverFile) {
        coverImageId = await uploadImage(form.coverFile);
      }

      // 2) Slug
      const slug = slugify(form.title);

      // 3) POST (без автора) — сервер lifecycle/policy ставит автора из JWT
      const payload: Record<string, unknown> = {
        title: form.title,
        slug,
        excerpt: form.excerpt ?? null,
        content: form.content ?? null,
        isFeatured: form.isFeatured ?? false,
        ...(coverImageId ? { coverImage: coverImageId } : {}),
      };

      const created = await createArticle(payload);
      const createdData = created?.data;

      setDebug({
        when: new Date().toISOString(),
        url: `/api/articles`,
        method: "POST",
        requestParams: payload,
        responseJson: created,
        note: createdData ? "Статья создана, автор будет выставлен сервером" : "Ответ без data",
      });

      if (createdData) {
        // Вставляем в список (после рефреша GET покажет автора, если lifecycle работает)
        setItems((prev) => [createdData, ...prev]);
        setForm({ title: "", excerpt: "", content: "", isFeatured: false, coverFile: null });
      } else {
        setError("Статья создана, но ответ пустой");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания статьи");
      setDebug({
        when: new Date().toISOString(),
        url: `/api/articles`,
        method: "POST",
        requestParams: {
          title: form.title,
          slug: slugify(form.title),
          excerpt: form.excerpt ?? null,
          content: form.content ?? null,
          isFeatured: form.isFeatured ?? false,
          coverFile: form.coverFile
            ? { name: form.coverFile.name, size: form.coverFile.size, type: form.coverFile.type }
            : null,
        },
        responseJson: { error: err instanceof Error ? err.message : String(err) },
        note: "Исключение при создании статьи",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthor) {
    return (
      <section className="p-4 space-y-4">
        <div className="text-gray-800 font-semibold">Недостаточно прав (требуется роль Author)</div>
        <div className="text-sm text-gray-600">Текущая роль: {roleType || "не определена"}.</div>
        <div>
          <Link to="/" className="text-sm text-blue-600 underline underline-offset-2">
            На главную
          </Link>
        </div>
      </section>
    );
  }

  if (!userId) {
    return (
      <section className="p-4 space-y-4">
        <div className="text-gray-800 font-semibold">Не удалось определить текущего пользователя</div>
        <div className="text-sm text-gray-600">
          Проверьте сохранение auth в localStorage/sessionStorage (ключ "auth:user") и корректность JWT.
        </div>
        <div>
          <Link to="/" className="text-sm text-blue-600 underline underline-offset-2">
            На главную
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {/* Заголовок и навигация */}
      <div className="flex items-center justify_between">
        <h2 className="text-3xl font-bold">Панель автора</h2>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-gray-600 hover:text-brand-500 underline underline-offset-2">
            На главную
          </Link>
          <button onClick={() => nav(0)} className="text-sm px-3 py-1 rounded border hover:bg-gray-50" title="Обновить">
            Обновить
          </button>
        </div>
      </div>

      {/* Красная панель: ошибка + подробная отладка */}
      {(error || debug) && (
        <div className="bg-red-50 text-red-700 border rounded p-3 whitespace-pre-wrap">
          {error && <div className="mb-2 font-semibold">Ошибка/состояние: {error}</div>}
          {formatDebug(debug)}
        </div>
      )}

      {/* Блок создания статьи */}
      <div className="rounded border bg-white p-4">
        <h3 className="text-xl font-semibold mb-3">Создать новость</h3>
        <form className="grid grid-cols-1 gap-4" onSubmit={handleCreate}>
          <div>
            <label className="block text-sm font-medium">Заголовок</label>
            <input
              className="mt-1 w-full border rounded p-2"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text_sm font-medium">Краткое описание</label>
            <textarea
              className="mt-1 w-full border rounded p-2"
              value={form.excerpt ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="Короткий текст-анонс (необязательно)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Контент (Markdown)</label>
            <textarea
              className="mt-1 w-full border rounded p-2 h-40"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="featured"
              type="checkbox"
              checked={form.isFeatured ?? false}
              onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
            />
            <label htmlFor="featured">Избранное</label>
          </div>

          <div>
            <label className="block text-sm font-medium">Обложка (картинка)</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 w-full"
              onChange={(e) => setForm((f) => ({ ...f, coverFile: e.target.files?.[0] ?? null }))}
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="bg-black text-white px-4 py-2 rounded disabled:opacity-60" disabled={submitting}>
              {submitting ? "Создание..." : "Создать"}
            </button>
          </div>
        </form>
      </div>

      {/* Список статей автора */}
      {loading ? (
        <div className="grid grid_cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SafeSkeleton key={i} className="h-64" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="space-y-2 text-gray-700">
          <div>У вас пока нет новостей.</div>
          <div className="text-xs text-gray-600">
            Если ожидаете увидеть записи — проверьте:
            {"\n"}- серверный lifecycle/контроллер реально проставляет автора из JWT;
            {"\n"}- у роли Author включены права на Article.find/create/delete;
            {"\n"}- поле связи в Article называется ровно "Author" (как в ответах API).
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((a, i) => (
              <div key={a.id ?? a.slug ?? i} className="space-y-2">
                <SafeArticleCard article={a} />
                <div className="flex items-center gap-2">
                  {a.slug ? (
                    <Link to={`/editor/${a.slug}`} className="px-3 py-1 text-sm rounded border hover:bg-gray-50">
                      Редактировать
                    </Link>
                  ) : a.id ? (
                    <Link to={`/editor/${a.id}`} className="px-3 py-1 text-sm rounded border hover:bg-gray-50">
                      Редактировать
                    </Link>
                  ) : null}

                  {a.id && (
                    <button
                      onClick={() => handleDelete(a.id!)}
                      className="px-3 py-1 text-sm rounded border border-red-600 text-red-600 hover:bg-red-50"
                    >
                      Удалить
                    </button>
                  )}
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
                onClick={() => changePage(page + 1)} disabled={page >= meta.pagination.pageCount}
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
