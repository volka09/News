import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@api/articles.ts";
import { API_URL } from "@api/client.ts";

export default function ArticleCard({ article }: { article: Article }): React.ReactElement {
  const imgUrl = article.coverImage?.url ? `${API_URL}${article.coverImage.url}` : null;

  return (
    <Link
      to={`/article/${article.slug}`}
      className="block rounded shadow hover:shadow-lg transition"
    >
      {imgUrl && (
        <img
          src={imgUrl}
          alt={article.coverImage?.alternativeText ?? article.title}
          className="w-full h-48 object-cover rounded-t"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-bold">{article.title}</h3>
        {article.excerpt && (
          <p className="text-sm text-gray-600 mt-2">{article.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
