import { createBrowserRouter } from "react-router-dom";
import Home from "@pages/Home.tsx";
import Article from "@pages/Article.tsx";
import Category from "@pages/Category.tsx";
import Login from "@pages/Login.tsx";
import Register from "@pages/Register.tsx";
import EditorArticleForm from "@pages/EditorArticleForm.tsx";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/category/:slug", element: <Category /> },
  { path: "/article/:slug", element: <Article /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/editor/article", element: <EditorArticleForm /> },
  { path: "/editor/article/:slug", element: <EditorArticleForm /> },
]);

export default router;
