export type Category = {
  id?: number;
  name?: string;
  slug?: string;
};

export type Media = {
  url?: string;
  alternativeText?: string;
};

export type Article = {
  id?: number;
  documentId?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  publishDate?: string;
  coverImage?: Media;
  category?: Category;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:1337";

/**
 * Получение всех статей
 */
export async function fetchArticles(): Promise<Article[]> {
  const url = `${API_URL}/api/articles?populate=*`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch articles");
  const json = await res.json();

  return (json?.data ?? []).map((item: any): Article => {
    const cat = item?.category ?? null;
    const img = item?.coverImage ?? null;

    return {
      id: item.id,
      documentId: item.documentId,
      title: item.title ?? "",
      slug: item.slug ?? "",
      excerpt: item.excerpt ?? "",
      content: item.content ?? "",
      publishDate: item.publishDate ?? "",
      category: cat ? { name: cat.name, slug: cat.slug } : undefined,
      coverImage: img
        ? {
            url: `${API_URL}${img.url}`, // добавляем базовый URL
            alternativeText: img.alternativeText,
          }
        : undefined,
    };
  });
}

/**
 * Получение последних статей
 */
export async function fetchLatestArticles(): Promise<Article[]> {
  const url = `${API_URL}/api/articles?populate=*&sort=publishDate:desc&pagination[pageSize]=9`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch articles");
  const json = await res.json();

  return (json?.data ?? []).map((item: any): Article => {
    const cat = item?.category ?? null;
    const img = item?.coverImage ?? null;

    return {
      id: item.id,
      documentId: item.documentId,
      title: item.title ?? "",
      slug: item.slug ?? "",
      excerpt: item.excerpt ?? "",
      content: item.content ?? "",
      publishDate: item.publishDate ?? "",
      category: cat ? { name: cat.name, slug: cat.slug } : undefined,
      coverImage: img
        ? {
            url: `${API_URL}${img.url}`, // добавляем базовый URL
            alternativeText: img.alternativeText,
          }
        : undefined,
    };
  });
}

/**
 * Получение одной статьи по slug
 */
export async function fetchArticle(slug: string): Promise<Article> {
  const url = `${API_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch article");
  const json = await res.json();

  const item = json?.data?.[0];
  if (!item) throw new Error("Article not found");

  const cat = item?.category ?? null;
  const img = item?.coverImage ?? null;

  return {
    id: item.id,
    documentId: item.documentId,
    title: item.title ?? "",
    slug: item.slug ?? "",
    excerpt: item.excerpt ?? "",
    content: item.content ?? "",
    publishDate: item.publishDate ?? "",
    category: cat ? { name: cat.name, slug: cat.slug } : undefined,
    coverImage: img
      ? {
          url: `${API_URL}${img.url}`, // добавляем базовый URL
          alternativeText: img.alternativeText,
        }
      : undefined,
  };
}
