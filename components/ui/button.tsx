import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "light" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "pressable select-none items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.005em] whitespace-nowrap disabled:opacity-45";

/** `cn` doesn't merge conflicting utilities, so a caller-supplied display class must replace ours. */
function display(className?: string) {
  return /(^|\s)(hidden|flex|inline-flex|block|inline-block|grid)(\s|$)/.test(className ?? "")
    ? null
    : "inline-flex";
}

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink hover:brightness-105 shadow-[0_8px_30px_-12px_rgb(212_255_63/0.55)]",
  light: "bg-fg text-ink hover:bg-white",
  secondary:
    "border border-line-2 bg-white/[0.04] text-fg hover:bg-white/[0.08] hover:border-white/25 backdrop-blur-md",
  ghost: "text-fg-2 hover:text-fg hover:bg-white/[0.05]",
  danger:
    "border border-white/15 bg-white/[0.04] text-fg hover:bg-white/[0.08]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-[54px] px-7 text-[15px]",
};

type Common = {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  block,
  icon,
  iconRight,
  loading,
  className,
  children,
  type = "button",
  disabled,
  ...props
}: Common & { loading?: boolean } & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, display(className), variants[variant], sizes[size], block && "w-full", className)}
      {...props}
    >
      {loading ? <span className="spinner" aria-hidden /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  block,
  icon,
  iconRight,
  className,
  children,
  ...props
}: Common & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  return (
    <Link
      href={href}
      className={cn(base, display(className), variants[variant], sizes[size], block && "w-full", className)}
      {...props}
    >
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}

export function IconButton({
  label,
  children,
  className,
  variant = "glass",
  ...props
}: {
  label: string;
  children: ReactNode;
  variant?: "glass" | "plain" | "solid";
} & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "pressable inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        variant === "glass" && "glass text-fg hover:bg-white/10",
        variant === "plain" && "text-fg-2 hover:bg-white/[0.06] hover:text-fg",
        variant === "solid" && "bg-fg text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconLink({
  label,
  children,
  className,
  variant = "glass",
  ...props
}: {
  label: string;
  children: ReactNode;
  variant?: "glass" | "plain";
} & Omit<ComponentProps<typeof Link>, "children">) {
  return (
    <Link
      aria-label={label}
      title={label}
      className={cn(
        "pressable relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        variant === "glass" && "glass text-fg hover:bg-white/10",
        variant === "plain" && "text-fg-2 hover:bg-white/[0.06] hover:text-fg",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
