import { get, post, put, del } from "./client";

export type Media = {
  id?: number;
  url?: string;
  alternativeText?: string;
};

export type CategoryRef = {
  id?: number;
  name?: string;
  slug?: string;
};

export type AuthorRef = {
  id?: number;
  username?: string;
};

export type Article = {
  id?: number;
  slug?: string;
  title: string;
  description?: string;
  content?: string;
  excerpt?: string;
  publishDate?: string;
  publishedAt?: string;

  coverUrl?: string;
  coverImage?: number | Media;

  views?: number;
  isFeatured?: boolean;
  readingTime?: number;

  category?: number | CategoryRef;
  Author?: number | AuthorRef;

  tags?: string[];

  isFavorite?: boolean;
  favoriteId?: number;
};

export type Pagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type Paginated<T> = {
  data: T[];
  meta: { pagination: Pagination };
};

/**
 * Последние статьи (Home.tsx)
 */
export function fetchLatestArticles(page = 1, pageSize = 9) {
  const qs = new URLSearchParams({
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
  });
  qs.append("sort[0]", "publishedAt:desc");
  qs.append("populate", "*");

  return get<Paginated<Article>>(`/api/articles?${qs.toString()}`);
}

/**
 * Универсальная выборка (Category.tsx)
 */
export function fetchArticles(filters: Record<string, string>, page = 1, pageSize = 9) {
  const qs = new URLSearchParams({
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
  });
  qs.append("sort[0]", "publishedAt:desc");
  qs.append("populate", "*");

  Object.entries(filters).forEach(([key, value]) => {
    const parts = key.split(".");
    if (parts.length === 1) {
      qs.append(`filters[${parts[0]}][$eq]`, value);
    } else if (parts.length === 2) {
      qs.append(`filters[${parts[0]}][${parts[1]}][$eq]`, value);
    }
  });

  return get<Paginated<Article>>(`/api/articles?${qs.toString()}`);
}

/**
 * Статья по slug
 */
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const qs = new URLSearchParams();
  qs.append("filters[slug][$eq]", slug);
  qs.append("populate", "*");

  const resp = await get<Paginated<Article>>(`/api/articles?${qs.toString()}`);
  return Array.isArray(resp.data) && resp.data.length ? resp.data[0] : null;
}

export async function fetchArticle(slug: string): Promise<Article> {
  const a = await fetchArticleBySlug(slug);
  if (!a) throw new Error("Статья не найдена");
  return a;
}

/**
 * Авторские статьи (AuthorDashboard.tsx)
 */
export function fetchAuthorArticles(authorId: number, page = 1, pageSize = 9) {
  const qs = new URLSearchParams({
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
  });
  qs.append("sort[0]", "publishedAt:desc");
  qs.append("populate", "*");
  qs.append("filters[Author][id][$eq]", String(authorId));

  return get<Paginated<Article>>(`/api/articles?${qs.toString()}`);
}

/**
 * CRUD
 */
export function createArticle(payload: Partial<Article>) {
  return post<Article>("/api/articles", { data: payload });
}

export function updateArticle(id: number, payload: Partial<Article>) {
  return put<Article>(`/api/articles/${id}`, { data: payload });
}

export function deleteArticle(id: number) {
  return del<void>(`/api/articles/${id}`);
}
