import React from "react";
import { Link } from "react-router-dom";
import { getRole, getUser, clearAuth } from "@utils/auth.ts";

export default function Navbar(): React.ReactElement {
  const role = getRole();
  const user = getUser<{ username: string }>();

  function logout() {
    clearAuth();
    location.reload();
  }

  return (
    <div className="container max-w-7xl flex items-center justify-between py-4">
      <Link to="/" className="text-xl font-bold tracking-tight">НОВОСТИ</Link>
      <div className="flex items-center gap-4">
        {role === "editor" && <Link to="/editor/article" className="text-sm underline">Создать новость</Link>}
        {user ? (
          <>
            <span className="text-sm text-gray-600">Привет, {user.username}</span>
            <button className="text-sm underline" onClick={logout}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm underline">Вход</Link>
            <Link to="/register" className="text-sm underline">Регистрация</Link>
          </>
        )}
      </div>
    </div>
  );
}
