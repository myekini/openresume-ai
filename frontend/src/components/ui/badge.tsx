/**
 * Badge — small status/label pill
 * Kbd — keyboard shortcut chip
 * Tag — monochrome label (replaces eyebrow usages)
 */
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "mono";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariants: Record<BadgeVariant, string> = {
  neutral: "bg-[#111] border-[#1c1c1c] text-[#6b6b6b]",
  success: "bg-[#0d2620] border-[#00e5a0]/15 text-[#00e5a0]/80",
  warning: "bg-[#1a1400] border-[#c8980a]/20 text-[#c8980a]/80",
  danger:  "bg-[#1a0808] border-[#ef4444]/15 text-[#ef4444]/70",
  mono:    "bg-[#111] border-[#1c1c1c] text-[#a3e635]/80",
};

export function Badge({ variant = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        "font-mono text-[9px] uppercase tracking-wider",
        "px-2 py-0.5 rounded-full border",
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** Keyboard shortcut chip — e.g. <Kbd>⌘K</Kbd> */
export function Kbd({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center",
        "font-mono text-[10px] text-[#4a4a4a]",
        "bg-[#0f0f0f] border border-[#1c1c1c]",
        "px-1.5 py-0.5 rounded",
        "shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.4)]",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

/** Tag / eyebrow label — demoted monochrome label above headings */
export function Tag({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.18em] text-[#333]",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** Toggle / Switch */
interface ToggleProps extends HTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  "aria-label"?: string;
}

export function Toggle({ checked = false, onCheckedChange, className, ...props }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full",
        "border transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-[#00e5a0]/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[#080808]",
        checked
          ? "bg-[#00e5a0]/15 border-[#00e5a0]/30"
          : "bg-[#111] border-[#1c1c1c]",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block h-3 w-3 rounded-full transition-all duration-200",
          checked
            ? "translate-x-5 bg-[#00e5a0] shadow-[0_0_6px_rgba(0,229,160,0.5)]"
            : "translate-x-1 bg-[#333]",
        )}
      />
    </button>
  );
}
