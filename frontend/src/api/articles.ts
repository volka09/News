import { apiFetch } from "./client";

export type Media = { id: number; url: string; alternativeText?: string };
export type CategoryRef = { id: number; name: string; slug: string };
export type AuthorRef = { id: number; username: string };

export type Article = {
  id?: number;
  documentId?: string;
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
  tags?: string[];
  seo?: { title?: string; description?: string };
  category?: CategoryRef | null;
  author?: AuthorRef | null;
};

export type Paginated<T> = {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
};

const populate = "populate=coverImage,category,author&fields=title,slug,excerpt,publishedAt,isFeatured,readingTime,views";
const PAGE_SIZE = 9;

export async function fetchLatestArticles(page = 1): Promise<Paginated<Article>> {
  return apiFetch<Paginated<Article>>(
    `/api/articles?${populate}&sort=publishedAt:desc&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
  );
}

export async function fetchArticles(filters: Record<string, string | number> = {}, page = 1): Promise<Paginated<Article>> {
  const filterQuery = Object.entries(filters)
    .map(([k, v]) => `filters[${k}][$eq]=${encodeURIComponent(String(v))}`)
    .join("&");
  const q = [populate, "sort=publishedAt:desc", filterQuery, `pagination[page]=${page}`, `pagination[pageSize]=${PAGE_SIZE}`]
    .filter(Boolean)
    .join("&");
  return apiFetch<Paginated<Article>>(`/api/articles?${q}`);
}

export async function fetchArticle(slug: string): Promise<Article> {
  const r = await apiFetch<Paginated<Article>>(`/api/articles?${populate}&filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[page]=1&pagination[pageSize]=1`);
  return r.data[0];
}

export async function fetchFeatured(page = 1): Promise<Paginated<Article>> {
  // если есть кастомный endpoint
  try {
    return await apiFetch<Paginated<Article>>(`/api/articles/featured?${populate}&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`);
  } catch {
    // fallback через стандартные фильтры
    return fetchArticles({ isFeatured: "true" }, page);
  }
}

// CRUD (требует JWT)
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
