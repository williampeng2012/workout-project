"use client";

import { Check, Info } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastAction = { label: string; onClick: () => void };
type Toast = { id: number; message: string; tone: "success" | "info"; action?: ToastAction };

type ShowToast = (message: string, tone?: Toast["tone"], action?: ToastAction) => void;

const ToastContext = createContext<ShowToast>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback<ShowToast>((message, tone = "success", action) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, tone, action });
    timer.current = window.setTimeout(() => setToast(null), action ? 5000 : 2600);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 z-[80]" style={{ bottom: "calc(var(--nav-h) + var(--safe-bottom) + 16px)" }}>
        {toast && (
          <div
            key={toast.id}
            className={`glass absolute left-1/2 flex max-w-[calc(100vw-40px)] items-center gap-2.5 rounded-full py-2.5 pl-3 text-sm font-medium shadow-2xl ${toast.action ? "pointer-events-auto pr-2" : "pr-4"}`}
            style={{ animation: "toast-in 420ms var(--ease-out) both" }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
              {toast.tone === "success" ? <Check size={14} strokeWidth={3} aria-hidden /> : <Info size={14} aria-hidden />}
            </span>
            <span className="truncate">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  window.clearTimeout(timer.current);
                  setToast(null);
                }}
                className="pressable ml-1 h-8 shrink-0 rounded-full bg-white/10 px-3.5 text-[13px] font-semibold text-fg hover:bg-white/15"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
