import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@api/client.ts";
import { saveAuth } from "@utils/auth.ts";
import type { Role } from "@utils/auth.ts"; // тип роли из utils

type AuthResponse = {
  jwt: string;
  user: {
    id: number;
    username: string;
    email?: string;
    role?: { type?: string; name?: string };
  };
};

export default function Login(): React.ReactElement {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await apiFetch<AuthResponse>("/api/auth/local", {
        method: "POST",
        body: JSON.stringify({ identifier: email, password }),
      });

      // Берём роль из ответа Strapi, если нет — fallback на "author"
      const roleValue = res.user?.role?.type ?? "author";

      // Приводим к типу Role
      const role = roleValue as Role;

      // Сохраняем авторизацию
      saveAuth(res.jwt, role, res.user);

      // Переадресация после входа
      nav("/");
    } catch {
      setError("Неверный логин или пароль");
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Вход</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Войти
        </button>
      </form>
    </div>
  );
}
