// frontend/src/components/Footer.tsx
import React from "react";

export default function Footer(): React.ReactElement {
  return React.createElement(
    "footer",
    { className: "bg-gray-100 border-t" },
    React.createElement(
      "div",
      { className: "container py-6 text-sm text-gray-600" },
      `© ${new Date().getFullYear()} Frontend`
    )
  );
}
