import React from "react";
import { cn } from "../utils/format.ts";

type Props = { className?: string };

export default function Skeleton({ className }: Props): React.ReactElement {
  return (
    <div className={cn("animate-pulse rounded-xl bg-gray-200", className)} />
  );
}
