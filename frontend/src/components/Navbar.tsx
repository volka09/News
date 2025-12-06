// frontend/src/components/Navbar.tsx
import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar(): React.ReactElement {
  return React.createElement(
    "nav",
    { className: "bg-brand-600 text-white" },
    React.createElement(
      "div",
      { className: "container flex items-center justify-between h-14" },
      React.createElement(Link, { to: "/", className: "font-semibold" }, "Frontend"),
      React.createElement(
        "div",
        { className: "flex gap-4" },
        React.createElement(
          NavLink,
          {
            to: "/",
            className: ({ isActive }: { isActive: boolean }) =>
              `hover:underline ${isActive ? "underline" : ""}`,
          },
          "Home"
        ),
        React.createElement(
          NavLink,
          {
            to: "/category/general",
            className: ({ isActive }: { isActive: boolean }) =>
              `hover:underline ${isActive ? "underline" : ""}`,
          },
          "Category"
        )
      )
    )
  );
}
