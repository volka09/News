// src/components/DebugBanner.tsx
import React from "react";
import { useLocation } from "react-router-dom";

type Props = {
  role: string | null;
  user: { id?: number; username?: string; role?: unknown } | null;
  jwt: string | null;
  favoritesCount: number | null;
  favoritesError: string;
  favoritesArticleIds: number[];
};

export default function DebugBanner({
  role,
  user,
  jwt,
  favoritesCount,
  favoritesError,
  favoritesArticleIds,
}: Props): React.ReactElement {
  const location = useLocation();

  const roleStr =
    typeof role === "string"
      ? role
      : typeof user?.role === "string"
      ? (user?.role as string)
      : (user?.role as { type?: string })?.type ?? "?";

  return (
    <div
      style={{
        background: "#b91c1c",
        color: "white",
        fontSize: "16px",
        padding: "10px",
        textAlign: "left",
        fontWeight: "bold",
        whiteSpace: "pre-wrap",
      }}
    >
      {[
        "DEBUG:",
        `role = ${String(roleStr ?? "null")}`,
        `userId = ${user?.id ?? "?"}`,
        `user = ${JSON.stringify(user ?? null)}`,
        `jwt = ${jwt ? `(len=${jwt.length})` : "null"}`,
        `path = ${location.pathname}${location.search || ""}`,
        favoritesError
          ? `favorites_error = ${favoritesError}`
          : `favorites_count = ${favoritesCount ?? "loading"}`,
        `favorites_article_ids = ${
          favoritesArticleIds.length ? favoritesArticleIds.join(",") : "[]"
        }`,
      ].join(" | ")}
    </div>
  );
}
