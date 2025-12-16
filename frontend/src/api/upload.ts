import { API_URL, withAuthHeaders } from "./client";

type UploadResult = Array<{
  id: number;
  url: string;
}>;

export async function uploadImage(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("files", file);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    headers: {
      ...withAuthHeaders(),
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
