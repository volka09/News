// src/routes/Router.tsx
import { createBrowserRouter } from "react-router-dom";
import Home from "@pages/Home.tsx";
import Article from "@pages/Article.tsx";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/article/:slug", element: <Article /> },
]);

export default router;
