/**
 * Button primitive
 *
 * Variants:
 *   primary   — #00e5a0 fill (use max twice per page)
 *   secondary — neutral outline, becomes filled on hover
 *   ghost     — text only, no border
 *   danger    — red destructive
 *
 * Sizes:
 *   sm | md | lg
 */
import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  sheen?: boolean; // light-sweep animation on hover
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      loading = false,
      sheen = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const base = [
      "relative inline-flex items-center justify-center gap-2",
      "font-medium rounded-sm select-none outline-none",
      "transition-all duration-150 ease-out",
      "focus-visible:ring-2 focus-visible:ring-[#00e5a0]/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[#080808]",
      "disabled:opacity-40 disabled:pointer-events-none",
      "overflow-hidden",
    ];

    const variants: Record<string, string> = {
      primary: [
        "bg-[#00e5a0] hover:bg-[#00cf93] text-black font-semibold",
        "shadow-[0_0_24px_rgba(0,229,160,0.16)]",
        "hover:shadow-[0_0_32px_rgba(0,229,160,0.24)]",
        "hover:scale-[1.02] active:scale-[0.99]",
      ].join(" "),
      secondary: [
        "bg-transparent border border-[#1c1c1c] hover:border-[#2a2a2a]",
        "text-[#6b6b6b] hover:text-[#e8e8e8]",
        "hover:bg-[#0f0f0f]",
        "active:scale-[0.99]",
      ].join(" "),
      ghost: [
        "bg-transparent border-none",
        "text-[#4a4a4a] hover:text-[#e8e8e8]",
        "active:scale-[0.99]",
      ].join(" "),
      danger: [
        "bg-transparent border border-[#3a1a1a] hover:border-[#ef4444]/40",
        "text-[#ef4444]/70 hover:text-[#ef4444]",
        "hover:bg-[#1a0a0a]",
        "active:scale-[0.99]",
      ].join(" "),
    };

    const sizes: Record<string, string> = {
      sm: "h-7 px-3 text-[12px] gap-1.5",
      md: "h-9 px-4 text-[13px]",
      lg: "h-11 px-7 text-[14px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {/* Sheen sweep */}
        {sheen && (
          <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full skew-x-[-30deg] group-hover:animate-[sheen_0.9s_ease-in-out] pointer-events-none" />
        )}

        {/* Loading spinner */}
        {loading && (
          <svg
            className="w-3.5 h-3.5 animate-spin shrink-0"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
            />
          </svg>
        )}

        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
