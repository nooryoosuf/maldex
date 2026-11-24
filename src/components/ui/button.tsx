import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-ink text-bg hover:bg-ink/85 border border-transparent",
  accent: "bg-accent text-white hover:bg-accent/90 border border-transparent dark:text-[#0b1220]",
  outline: "border border-line bg-surface text-ink hover:bg-surface-2 hover:border-line-strong",
  subtle: "border border-transparent bg-surface-2 text-ink hover:bg-surface-3",
  ghost: "border border-transparent text-muted hover:bg-surface-2 hover:text-ink",
  danger: "border border-negative/25 bg-negative/10 text-negative hover:bg-negative/15",
} as const;

const sizes = {
  sm: "h-8 px-2.5 text-xs gap-1.5 rounded-sm",
  md: "h-9 px-3.5 text-sm gap-2 rounded",
  lg: "h-10 px-4 text-sm gap-2 rounded",
  icon: "h-8 w-8 justify-center rounded-sm",
  "icon-sm": "h-7 w-7 justify-center rounded-sm",
} as const;

export function buttonVariants({
  variant = "outline",
  size = "md",
  className,
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
} = {}) {
  return cn(
    "inline-flex select-none items-center whitespace-nowrap font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45",
    variants[variant],
    sizes[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "outline", size = "md", type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={buttonVariants({ variant, size, className })} {...props} />;
});
