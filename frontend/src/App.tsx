// src/App.tsx
import React, { useEffect, useState } from "react";
import { Link, Routes, Route } from "react-router-dom";

import Home from "@pages/Home.tsx";
import Article from "@pages/Article.tsx";
import Category from "@pages/Category.tsx";
import Login from "@pages/Login.tsx";
import Register from "@pages/Register.tsx";
import EditorArticleForm from "@pages/EditorArticleForm.tsx";
import AuthorDashboard from "@pages/AuthorDashboard.tsx";
import FeaturedPage from "@pages/FeaturedPage.tsx";

import { getRole, getUser, clearAuth } from "@utils/auth.ts";
import { apiFetch } from "@api/client.ts";
import DebugBanner from "@components/DebugBanner.tsx";

type FavoriteItem = {
  id: number;
  attributes: {
    article?: {
      data?: {
        id: number;
      };
    };
    user?: {
      data?: {
        id: number;
      };
    };
  };
};
type FavoritesResp = { data: FavoriteItem[] };

const categoryMap: Record<string, string> = {
  Политика: "politika",
  Технологии: "tehnologii",
  Спорт: "sport",
  Культура: "kultura",
};

function getJwt(): string | null {
  try {
    const raw = localStorage.getItem("auth:user") || sessionStorage.getItem("auth:user");
    if (!raw) return null;
    const obj = JSON.parse(raw) as { jwt?: string };
    return obj?.jwt ?? null;
  } catch {
    return null;
  }
}

export default function App(): React.ReactElement {
  const role = getRole();
  const user = getUser<{ username: string; id?: number; role?: unknown }>();
  const jwt = getJwt();

  const [favoritesCount, setFavoritesCount] = useState<number | null>(null);
  const [favoritesError, setFavoritesError] = useState<string>("");
  const [favoritesArticleIds, setFavoritesArticleIds] = useState<number[]>([]);

  useEffect(() => {
    let mounted = true;

    if (!user?.id) {
      setFavoritesCount(0);
      setFavoritesArticleIds([]);
      setFavoritesError("Не авторизован");
      return () => {
        mounted = false;
      };
    }

    const params = new URLSearchParams();
    params.set("filters[user][id][$eq]", String(user.id));
    params.set("populate[article]", "true");
    params.set("fields[0]", "id");
    params.set("pagination[page]", "1");
    params.set("pagination[pageSize]", "100");

    apiFetch<FavoritesResp>(`/api/favorites/user`, { method: "GET" })
      .then((resp) => {
        if (!mounted) return;
        const list = Array.isArray(resp?.data) ? resp.data : [];
        setFavoritesCount(list.length);
        const ids =
          list
            .map((fav: any) => fav.article?.id)
            .filter((id): id is number => typeof id === "number") ?? [];
        setFavoritesArticleIds(ids);
        setFavoritesError("");
      })
      .catch((e) => {
        if (!mounted) return;
        setFavoritesError(e instanceof Error ? e.message : String(e));
        setFavoritesCount(0);
        setFavoritesArticleIds([]);
      });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  function logout() {
    clearAuth();
    location.reload();
  }

  return (
    <div className="min-h-screen flex flex-col">
      

      <header className="bg-black text-white">
        <div className="container max-w-7xl flex items-center justify-between py-4">
          <Link to="/">
            <h1 className="text-xl font-bold tracking-tight hover:text-brand-400 transition-colors text-white">
              НОВОСТИ
            </h1>
          </Link>
          <nav className="flex gap-6 tracking-tight font-bold">
            {["Все", "Политика", "Технологии", "Спорт", "Культура"].map((c) => (
              <Link
                key={c}
                to={c === "Все" ? "/" : `/category/${categoryMap[c]}`}
                className="hover:text-brand-400 transition-colors text-white"
              >
                {c}
              </Link>
            ))}
            <Link to="/featured" className="hover:text-brand-400 transition-colors text-white">
              Избранные
            </Link>
          </nav>
          <div className="flex items-center gap-4 text-sm">
            {role?.toLowerCase() === "editor" && (
              <Link to="/editor/article" className="underline">
                Создать новость
              </Link>
            )}
            {role?.toLowerCase() === "author" && (
              <Link to="/author" className="underline">
                Панель автора
              </Link>
            )}
            {user ? (
              <>
                <span className="text-gray-300">Привет, {user.username}</span>
                <button onClick={logout} className="underline">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-brand-400 transition-colors text-white">
                  Вход
                </Link>
                <Link to="/register" className="hover:text-brand-400 transition-colors text-white">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-7xl flex-grow py-10 px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/editor/article" element={<EditorArticleForm />} />
          <Route path="/editor/article/:slug" element={<EditorArticleForm />} />
          <Route path="/editor/:id" element={<EditorArticleForm />} />
          <Route path="/author" element={<AuthorDashboard />} />
          <Route path="/featured" element={<FeaturedPage />} />
        </Routes>
      </main>

      <footer className="bg-black text-white mt-12">
        <div className="container max-w-7xl py-6 text-sm text-gray-400">
          © {new Date().getFullYear()} Новости.
        </div>
      </footer>
    </div>
  );
}
