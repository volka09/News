import React, { useEffect, useState } from "react";
import { createArticle, updateArticle, fetchArticle } from "@api/articles.ts";
import { getRole } from "@utils/auth.ts";
import { useNavigate, useParams } from "react-router-dom";

export default function EditorArticleForm(): React.ReactElement {
  const role = getRole();
  const nav = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(slug);

  useEffect(() => {
    if (!isEdit) return;
    fetchArticle(slug!)
      .then((a) => {
        setTitle(a.title ?? "");
        setExcerpt(a.excerpt ?? "");
        setContent(a.content ?? "");
        setIsFeatured(Boolean(a.isFeatured));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Не удалось загрузить статью"));
  }, [slug, isEdit]);

  if (role !== "editor") {
    return <div className="text-gray-600">Недостаточно прав</div>;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (isEdit && aIdFromSlug(slug)) {
        await updateArticle(aIdFromSlug(slug)!, { title, excerpt, content, isFeatured });
      } else {
        await createArticle({ title, excerpt, content, isFeatured });
      }
      nav("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
      <h1 className="text-2xl font-bold mb-4">{isEdit ? "Редактировать новость" : "Создать новость"}</h1>
      {error && <div className="bg-red-50 text-red-700 border rounded p-2 mb-3">{error}</div>}
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium">Заголовок</label>
          <input className="mt-1 w-full border rounded p-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Краткое описание</label>
          <textarea className="mt-1 w-full border rounded p-2" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Контент</label>
          <textarea className="mt-1 w-full border rounded p-2 h-48" value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>
        <div className="flex items-center gap-2">
          <input id="featured" type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          <label htmlFor="featured">Избранное</label>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded">{isEdit ? "Сохранить" : "Создать"}</button>
      </form>
    </div>
  );
}

function aIdFromSlug(slug?: string): number | undefined {
  // в реальном проекте лучше запрашивать id по slug
  return undefined;
}
