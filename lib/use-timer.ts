"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  /** Called once per whole second while running, with the seconds left (e.g. 3, 2, 1). */
  onTick?: (secondsLeft: number) => void;
  /** Called once when the countdown reaches zero. */
  onDone?: () => void;
};

type Clock = { endsAt: number | null; heldMs: number };

/**
 * Countdown driven by a deadline rather than by counting intervals, so it stays
 * accurate when the browser throttles timers (background tabs, low-power mode).
 */
export function useTimer({ onTick, onDone }: Options = {}) {
  const [clock, setClock] = useState<Clock>({ endsAt: null, heldMs: 0 });
  const [now, setNow] = useState(0);
  const clockRef = useRef(clock);
  const callbacks = useRef({ onTick, onDone });
  const lastSecond = useRef<number | null>(null);

  useEffect(() => {
    callbacks.current = { onTick, onDone };
  });

  const commit = useCallback((next: Clock) => {
    clockRef.current = next;
    setClock(next);
  }, []);

  const { endsAt } = clock;
  useEffect(() => {
    if (endsAt === null) return;
    const tick = () => {
      const t = Date.now();
      const left = endsAt - t;
      setNow(t);
      if (left <= 0) {
        lastSecond.current = null;
        commit({ endsAt: null, heldMs: 0 });
        callbacks.current.onDone?.();
        return;
      }
      const s = Math.ceil(left / 1000);
      if (s !== lastSecond.current) {
        lastSecond.current = s;
        callbacks.current.onTick?.(s);
      }
    };
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [endsAt, commit]);

  const start = useCallback(
    (seconds: number) => {
      const t = Date.now();
      lastSecond.current = Math.ceil(seconds);
      setNow(t);
      commit({ endsAt: t + seconds * 1000, heldMs: 0 });
    },
    [commit],
  );

  const pause = useCallback(() => {
    const { endsAt: end } = clockRef.current;
    if (end === null) return;
    commit({ endsAt: null, heldMs: Math.max(0, end - Date.now()) });
  }, [commit]);

  const resume = useCallback(() => {
    const { endsAt: end, heldMs } = clockRef.current;
    if (end !== null || heldMs <= 0) return;
    const t = Date.now();
    setNow(t);
    commit({ endsAt: t + heldMs, heldMs });
  }, [commit]);

  /** Stop and show a fixed value without counting (e.g. before a move starts). */
  const set = useCallback(
    (seconds: number) => {
      lastSecond.current = null;
      commit({ endsAt: null, heldMs: seconds * 1000 });
    },
    [commit],
  );

  const add = useCallback(
    (seconds: number) => {
      const { endsAt: end, heldMs } = clockRef.current;
      commit({ endsAt: end === null ? null : end + seconds * 1000, heldMs: heldMs + seconds * 1000 });
    },
    [commit],
  );

  const remainingMs = clock.endsAt === null ? clock.heldMs : Math.max(0, clock.endsAt - now);

  return {
    secondsLeft: Math.ceil(remainingMs / 1000),
    running: clock.endsAt !== null,
    start,
    pause,
    resume,
    set,
    add,
  };
}
