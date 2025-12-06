import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import Home from "@pages/Home.tsx";
import Article from "@pages/Article.tsx";
import Category from "@pages/Category.tsx";
import Login from "@pages/Login.tsx";
import Register from "@pages/Register.tsx";
import EditorArticleForm from "@pages/EditorArticleForm.tsx";
import { getRole, getUser, clearAuth } from "@utils/auth.ts";

// Словарь соответствий: русское название → slug
const categoryMap: Record<string, string> = {
  Политика: "politika",
  Технологии: "tehnologii",
  Спорт: "sport",
  Культура: "kultura",
};

export default function App(): React.ReactElement {
  const role = getRole();
  const user = getUser<{ username: string }>();

  function logout() {
    clearAuth();
    location.reload(); // мгновенно обновляем интерфейс после выхода
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="container max-w-7xl flex items-center justify-between py-4">
          <Link to="/">
            <h1 className="text-xl font-bold tracking-tight hover:text-brand-400 transition-colors text-white">НОВОСТИ</h1>
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
          </nav>
          <div className="flex items-center gap-4 text-sm">
            {role === "editor" && (
              <Link to="/editor/article" className="underline">
                Создать новость
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

      {/* Main */}
      <main className="container max-w-7xl flex-grow py-10 px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/editor/article" element={<EditorArticleForm />} />
          <Route path="/editor/article/:slug" element={<EditorArticleForm />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white mt-12">
        <div className="container max-w-7xl py-6 text-sm text-gray-400">
          © {new Date().getFullYear()} Новости. Все права АБСОЛЮТНО НЕ защищены, но что поделаешь :(.
        </div>
      </footer>
    </div>
  );
}
