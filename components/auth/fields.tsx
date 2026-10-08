"use client";

import { AlertCircle, CheckCircle2, Eye, EyeOff, Info } from "lucide-react";
import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "Enter your email address.";
  if (!EMAIL_RE.test(value.trim())) return "That email doesn't look right.";
  return null;
}

export function passwordScore(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  else if (/\d|[^A-Za-z0-9]/.test(pw)) score += 0.5;
  return Math.min(4, Math.max(1, Math.floor(score))) as 1 | 2 | 3 | 4;
}

export function validateNewPassword(pw: string): string | null {
  if (!pw) return "Create a password.";
  if (pw.length < 8) return "Use at least 8 characters.";
  return null;
}

const inputBase =
  "h-[52px] w-full rounded-[var(--radius)] border bg-white/[0.03] px-4 text-[15px] text-fg placeholder:text-fg-4 outline-none transition-[border-color,background-color,box-shadow] duration-200 focus:bg-white/[0.05] focus:border-white/40 focus:shadow-[0_0_0_4px_rgb(255_255_255/0.06)]";

type FieldProps = {
  label: string;
  error?: string | null;
  hint?: ReactNode;
  trailing?: ReactNode;
} & Omit<ComponentProps<"input">, "children">;

export function TextField({ label, error, hint, trailing, className, id, ...props }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-2 block text-[13px] font-semibold text-fg-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            inputBase,
            error ? "border-[#ff8a7a]/70" : "border-line-2",
            trailing ? "pr-14" : null,
          )}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="enter-soft mt-2 flex items-center gap-1.5 text-[13px] text-[#ffb4a8]">
          <AlertCircle size={14} aria-hidden /> {error}
        </p>
      ) : hint ? (
        <div id={`${inputId}-hint`} className="mt-2 text-[12.5px] text-fg-3">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export function PasswordField({
  showStrength,
  ...props
}: Omit<FieldProps, "type" | "trailing"> & { showStrength?: boolean }) {
  const [visible, setVisible] = useState(false);
  const value = typeof props.value === "string" ? props.value : "";
  const score = passwordScore(value);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      hint={
        showStrength && value && !props.error ? (
          <div className="flex items-center gap-3" aria-live="polite">
            <div className="flex flex-1 gap-1" aria-hidden>
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-300",
                    i <= score ? (score >= 3 ? "bg-accent" : "bg-fg-2") : "bg-white/10",
                  )}
                />
              ))}
            </div>
            <span className="w-14 text-right font-semibold text-fg-2">{labels[score]}</span>
          </div>
        ) : (
          props.hint
        )
      }
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="pressable flex h-10 w-10 items-center justify-center rounded-full text-fg-3 hover:bg-white/[0.06] hover:text-fg"
        >
          {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      }
    />
  );
}

export function FormNotice({
  tone = "info",
  children,
  action,
}: {
  tone?: "info" | "error" | "success";
  children: ReactNode;
  action?: ReactNode;
}) {
  const Icon = tone === "error" ? AlertCircle : tone === "success" ? CheckCircle2 : Info;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "enter-soft flex gap-3 rounded-[var(--radius)] border p-4 text-[13.5px] leading-relaxed",
        tone === "error" && "border-[#ff8a7a]/30 bg-[#ff8a7a]/[0.07] text-[#ffd3cc]",
        tone === "success" && "border-accent/30 bg-accent/[0.07] text-fg",
        tone === "info" && "border-line-2 bg-white/[0.03] text-fg-2",
      )}
    >
      <Icon
        size={17}
        className={cn("mt-0.5 shrink-0", tone === "success" ? "text-accent" : tone === "error" ? "" : "text-fg-3")}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        {children}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

export function Divider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-4">
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
