// src/Router.tsx
import React, { Suspense } from "react";
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";

import Home from "@pages/Home.tsx";
import Article from "@pages/Article.tsx";
import Category from "@pages/Category.tsx";
import Login from "@pages/Login.tsx";
import Register from "@pages/Register.tsx";
import EditorArticleForm from "@pages/EditorArticleForm.tsx";
import AuthorDashboard from "@pages/AuthorDashboard.tsx";
import FeaturedPage from "@pages/FeaturedPage.tsx"; // страница избранных

import Navbar from "@components/Navbar.tsx";
import DebugBanner from "@components/DebugBanner.tsx";

function RootLayout(): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col">
      <DebugBanner />
      <Navbar />
      <main className="container max-w-7xl flex-1 py-6">
        <Suspense fallback={<div>Загрузка...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "article/:slug", element: <Article /> },
      { path: "category/:slug", element: <Category /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "editor/:slug?", element: <EditorArticleForm /> },
      { path: "author", element: <AuthorDashboard /> },
      { path: "featured", element: <FeaturedPage /> }, // маршрут избранных
      // Fallback: если путь не найден, уходим на главную, чтобы не было белого экрана
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function Router(): React.ReactElement {
  return <RouterProvider router={router} />;
}
