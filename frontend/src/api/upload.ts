import { API_URL, withAuthHeaders } from "./client";

type UploadResult = Array<{
  id: number;
  url: string;
  // другие поля Strapi upload ответа
}>;

/**
 * Загружает один файл в Strapi Upload API.
 * Возвращает массив загруженных файлов (обычно один элемент).
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("files", file);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    headers: {
      // ВАЖНО: не ставить Content-Type вручную — пусть его выставит браузер для FormData
      ...withAuthHeaders(), // добавит Authorization: Bearer <jwt>, если доступен
    } as HeadersInit,
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upload ${res.status}: ${text || res.statusText}`);
  }

  const data = (await res.json()) as UploadResult;
  return data;
}
