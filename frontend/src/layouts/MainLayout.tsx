// frontend/src/layouts/MainLayout.tsx
import React, { PropsWithChildren } from "react";
import Navbar from "@components/Navbar.tsx";
import Footer from "@components/Footer.tsx";

export default function MainLayout({ children }: PropsWithChildren<{}>): React.ReactElement {
  return React.createElement(
    "div",
    { className: "min-h-screen flex flex-col bg-brand-50" },
    React.createElement(Navbar, null),
    React.createElement("main", { className: "flex-1 container py-6" }, children),
    React.createElement(Footer, null)
  );
}
