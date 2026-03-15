/**
 * Input + Textarea primitives
 *
 * Always bottom-border only (no full rect border) — clean, editor-like feel.
 * Focus: accent bottom border, no box shadow.
 */
import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, mono, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="font-mono text-[10px] uppercase tracking-widest text-[#333]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full bg-transparent border-0 border-b pb-1.5",
            "border-[#1c1c1c] focus:border-[#00e5a0]",
            "outline-none ring-0",
            "transition-colors duration-150",
            "text-[#e8e8e8] placeholder:text-[#2a2a2a]",
            mono ? "font-mono text-xs" : "text-[13px]",
            error && "border-[#ef4444]/60 focus:border-[#ef4444]",
            className,
          )}
          {...props}
        />
        {error && (
          <span className="font-mono text-[10px] text-[#ef4444]">{error}</span>
        )}
        {hint && !error && (
          <span className="font-mono text-[10px] text-[#2a2a2a]">{hint}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="font-mono text-[10px] uppercase tracking-widest text-[#333]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full bg-transparent border-0 border-b pb-1.5 resize-none",
            "border-[#1c1c1c] focus:border-[#00e5a0]",
            "outline-none ring-0",
            "transition-colors duration-150",
            "text-[13px] text-[#e8e8e8] placeholder:text-[#2a2a2a]",
            "custom-scrollbar",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

/** Compact chat-style textarea with a send button slot */
export function ChatInput({
  children,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-sm p-3",
        "bg-[#0f0f0f] border border-[#1c1c1c]",
        "hover:border-[#2a2a2a] focus-within:border-[#00e5a0]",
        "transition-colors duration-150",
        className,
      )}
    >
      <textarea
        className="flex-1 bg-transparent border-none outline-none text-[13px] resize-none min-h-[36px] max-h-[120px] text-[#e8e8e8] placeholder:text-[#2a2a2a] custom-scrollbar"
        rows={2}
        {...props}
      />
      {children}
    </div>
  );
}
