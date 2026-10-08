"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Modal bottom sheet (centered dialog on desktop). Esc / backdrop closes. */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      "button, [href], input, select, textarea",
    );
    focusable?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const nodes = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            "button:not([disabled]), [href], input, select, textarea",
          ),
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ animation: "fade-in 260ms ease both" }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[calc(100dvh-16px)] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[24px] border border-line bg-surface-1 p-6 shadow-2xl sm:rounded-[24px]"
        style={{
          paddingBottom: "calc(24px + var(--safe-bottom))",
          animation: "sheet-up 420ms var(--ease-out) both",
        }}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/15 sm:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="t-heading text-xl">
              {title}
            </h2>
            {description && <p className="t-small mt-1.5">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="pressable -mr-2 -mt-1 flex h-9 w-9 items-center justify-center rounded-full text-fg-2 hover:bg-white/5 hover:text-fg"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>,
    document.body,
  );
}
