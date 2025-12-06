import React from "react";
import { Link } from "react-router-dom";
import { formatDate } from "@utils/format.ts";
import { readingTime } from "@utils/readingTime.ts";
import type { Article } from "@api/articles.ts";

type Props = { article: Article };

export default function ArticleCard({ article }: Props): React.ReactElement {
  // Важные исправления: используем trim() и ||, чтобы пустые строки не проходили
  const title = (article.title?.trim() || "Без названия");
  const slug = (article.slug?.trim() || "");
  const excerpt = (article.excerpt?.trim() || "");
  const date = article.publishDate ? formatDate(article.publishDate) : "";
  const rt = readingTime(article.content ?? "");
  const coverUrl = (article.coverImage?.url?.trim() || "");
  const categoryName = (article.category?.name?.trim() || "");
  const categorySlug = (article.category?.slug?.trim() || "");

  return (
    <article className="group rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
      {coverUrl && slug && (
        <Link to={`/article/${slug}`} aria-label={title}>
          <img
            src={coverUrl}
            alt={title}
            className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </Link>
      )}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {slug ? (
            <Link to={`/article/${slug}`} className="hover:text-brand-600 transition-colors">
              {title}
            </Link>
          ) : (
            <span>{title}</span>
          )}
        </h3>
        {excerpt && (
          <p className="text-sm text-gray-700 line-clamp-3 flex-grow">{excerpt}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {date && <span>{date}</span>}
          <span>{rt}</span>
          {categorySlug && (
            <Link
              to={`/category/${categorySlug}`}
              className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
            >
              {categoryName || "Категория"}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
