// frontend/src/components/MotionFade.tsx
import React, { PropsWithChildren } from "react";

export default function MotionFade({ children }: PropsWithChildren<{}>): React.ReactElement {
  return React.createElement(
    "div",
    { className: "opacity-0 animate-[fadeIn_300ms_ease-out_forwards]" },
    children
  );
}
