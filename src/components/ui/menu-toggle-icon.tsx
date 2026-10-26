import React from "react";
import { cn } from "@/lib/utils";

export interface MenuToggleIconProps {
  open: boolean;
  className?: string;
  duration?: number;
}

export function MenuToggleIcon({ open, className, duration = 300 }: MenuToggleIconProps) {
  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ transition: `all ${duration}ms ease` }}
    >
      <svg
        className="size-full overflow-visible"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line
          x1="4"
          y1="6"
          x2="20"
          y2="6"
          style={{
            transformOrigin: "center",
            transform: open ? "translateY(6px) rotate(45deg)" : "none",
            transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`
          }}
        />
        <line
          x1="4"
          y1="12"
          x2="20"
          y2="12"
          style={{
            opacity: open ? 0 : 1,
            transition: `opacity ${duration / 2}ms ease`
          }}
        />
        <line
          x1="4"
          y1="18"
          x2="20"
          y2="18"
          style={{
            transformOrigin: "center",
            transform: open ? "translateY(-6px) rotate(-45deg)" : "none",
            transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`
          }}
        />
      </svg>
    </div>
  );
}
