import * as React from "react";
import { cn } from "@/lib/utils";

type LoaderProps = {
  size?: number;
  color?: string;
  variant?: "spinner" | "orbit";
  label?: string;
  className?: string;
};

export function Loader({
  size = 20,
  color,
  variant = "spinner",
  label = "Loading",
  className,
}: LoaderProps) {
  const style = {
    width: size,
    height: size,
    ...(color ? { color } : {}),
  };

  return (
    <span
      role="status"
      aria-label={label}
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={style}
    >
      {variant === "spinner" ? (
        <span
          aria-hidden="true"
          className="h-full w-full animate-spin rounded-full border-2 border-current/20 border-t-current"
        />
      ) : (
        <span
          aria-hidden="true"
          className="relative block h-full w-full animate-spin rounded-full border-2 border-current/25"
        >
          <span className="absolute -top-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-current" />
        </span>
      )}
    </span>
  );
}
