export type Category = {
  id?: number;
  documentId?: string;
  name?: string;
  slug?: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:1337";

/**
 * Получение списка категорий из Strapi v4
 */
export async function fetchCategories(): Promise<Category[]> {
  const url = `${API_URL}/api/categories`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const json = await res.json();

  return (json?.data ?? []).map((item: any): Category => {
    return {
      id: item.id,
      documentId: item.documentId,
      name: item.name ?? "",
      slug: item.slug ?? ""
    };
  });
}
