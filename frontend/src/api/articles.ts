import { apiFetch } from "./client";

export type Media = { id: number; url: string; alternativeText?: string };
export type CategoryRef = { id: number; name: string; slug: string };
export type AuthorRef = { id: number; username: string };

export type Article = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  publishDate?: string;
  publishedAt?: string;
  coverImage?: Media | null;
  views?: number;
  isFeatured?: boolean;
  readingTime?: number;
  source?: string;
  seo?: { title?: string; description?: string };
  category?: CategoryRef | null;
  Author?: AuthorRef | null;
  isFavorite?: boolean;
  favoriteId?: number;
  tags?: string[];
};

export type Paginated<T> = {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
};

// ✅ populate только существующих связей
const POPULATE = "populate[category]=true&populate[coverImage]=true&populate[Author]=true";
const PAGE_SIZE = 9;

export async function fetchLatestArticles(page = 1): Promise<Paginated<Article>> {
  return apiFetch<Paginated<Article>>(
    `/api/articles?${POPULATE}&sort=publishedAt:desc&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`,
    { auth: true }
  );
}

export async function fetchArticles(filters: Record<string, string | number | boolean> = {}, page = 1): Promise<Paginated<Article>> {
  const filterQuery = Object.entries(filters)
    .map(([k, v]) => {
      const fixedKey = k.includes(".") ? k.replace(/\./g, "][") : k;
      const value = typeof v === "boolean" ? v : encodeURIComponent(String(v));
      return `filters[${fixedKey}][$eq]=${value}`;
    })
    .join("&");

  const q = [
    POPULATE,
    "sort=publishedAt:desc",
    filterQuery,
    `pagination[page]=${page}`,
    `pagination[pageSize]=${PAGE_SIZE}`,
  ].filter(Boolean).join("&");

  return apiFetch<Paginated<Article>>(`/api/articles?${q}`, { auth: true });
}

export async function fetchArticle(slug: string): Promise<Article> {
  const r = await apiFetch<Paginated<Article>>(
    `/api/articles?${POPULATE}&filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[page]=1&pagination[pageSize]=1`,
    { auth: true }
  );
  return r.data[0];
}

export async function fetchFeatured(page = 1): Promise<Paginated<Article>> {
  try {
    return await apiFetch<Paginated<Article>>(
      `/api/articles/featured?${POPULATE}&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`,
      { auth: true }
    );
  } catch {
    return fetchArticles({ isFeatured: true }, page);
  }
}

export async function createArticle(payload: Partial<Article>): Promise<Article> {
  return apiFetch<Article>("/api/articles", {
    method: "POST",
    body: JSON.stringify({ data: payload }),
    auth: true,
  });
}

export async function updateArticle(id: number, payload: Partial<Article>): Promise<Article> {
  return apiFetch<Article>(`/api/articles/${id}`, {
    method: "PUT",
    body: JSON.stringify({ data: payload }),
    auth: true,
  });
}

export async function deleteArticle(id: number): Promise<void> {
  await apiFetch<void>(`/api/articles/${id}`, { method: "DELETE", auth: true });
}
