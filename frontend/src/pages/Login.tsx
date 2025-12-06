import React, { useState } from "react";
import { login } from "@api/auth.ts";
import { saveAuth } from "@utils/auth.ts";
import { useNavigate } from "react-router-dom";

export default function Login(): React.ReactElement {
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await login({ identifier, password });
      // роль можно получить из профиля или задать после логина (например, из claims)
      const role: "authenticated" | "editor" = "authenticated";
      saveAuth(res.jwt, role, res.user);
      nav("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка авторизации");
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded shadow p-6">
      <h1 className="text-2xl font-bold mb-4">Вход</h1>
      {error && <div className="bg-red-50 text-red-700 border rounded p-2 mb-3">{error}</div>}
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input className="mt-1 w-full border rounded p-2" value={identifier} onChange={(e) => setIdentifier(e.target.value)} type="email" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Пароль</label>
          <input className="mt-1 w-full border rounded p-2" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        <button className="bg-black text-white px-4 py-2 rounded">Войти</button>
      </form>
    </div>
  );
}
