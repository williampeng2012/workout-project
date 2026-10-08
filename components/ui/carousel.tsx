"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/cn";

export type Slide = {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  description?: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
  live?: boolean;
  position?: string;
};

const RESUME_AFTER_MS = 9000;

export function Carousel({
  slides,
  interval = 4500,
  label = "Featured",
  className,
  aspect = "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9]",
}: {
  slides: Slide[];
  interval?: number;
  label?: string;
  className?: string;
  aspect?: string;
}) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(true);
  const [pausedUntil, setPausedUntil] = useState(0);
  const [now, setNow] = useState(0);
  const [reduced, setReduced] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number; t: number; axis: "x" | "y" | null } | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  const userInteracted = useCallback(() => {
    const t = Date.now();
    setNow(t);
    setPausedUntil(t + RESUME_AFTER_MS);
  }, []);

  const manualPause = now < pausedUntil;
  const playing = count > 1 && !reduced && !hovered && inView && !dragging && !manualPause;

  // Autoplay
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => go(index + 1), interval);
    return () => window.clearTimeout(id);
  }, [playing, index, interval, go]);

  // Wake up once the manual pause elapses
  useEffect(() => {
    if (!manualPause) return;
    const id = window.setTimeout(() => setNow(Date.now()), pausedUntil - now + 20);
    return () => window.clearTimeout(id);
  }, [manualPause, pausedUntil, now]);

  // Pause when the tab is hidden
  useEffect(() => {
    const onVis = () => setInView(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  function onPointerDown(e: ReactPointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, t: performance.now(), axis: null };
    moved.current = false;
  }

  function onPointerMove(e: ReactPointerEvent) {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      s.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (s.axis === "x") {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        setDragging(true);
      }
    }
    if (s.axis !== "x") return;
    moved.current = true;
    const atEdge = (index === 0 && dx > 0) || (index === count - 1 && dx < 0);
    setDrag(atEdge ? dx * 0.35 : dx);
  }

  function onPointerUp(e: ReactPointerEvent) {
    const s = start.current;
    start.current = null;
    if (!s || s.axis !== "x") {
      setDragging(false);
      return;
    }
    const width = rootRef.current?.offsetWidth ?? 1;
    const dx = e.clientX - s.x;
    const velocity = dx / Math.max(1, performance.now() - s.t);
    if (dx < -width * 0.18 || velocity < -0.45) go(Math.min(count - 1, index + 1));
    else if (dx > width * 0.18 || velocity > 0.45) go(Math.max(0, index - 1));
    setDrag(0);
    setDragging(false);
    userInteracted();
  }

  if (count === 0) return null;

  return (
    <section
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("relative overflow-hidden rounded-[var(--radius-lg)] bg-surface-1", aspect, className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          go(index + 1);
          userInteracted();
        } else if (e.key === "ArrowLeft") {
          go(index - 1);
          userInteracted();
        }
      }}
    >
      <div
        className="flex h-full touch-pan-y"
        style={{
          transform: `translate3d(calc(${-index * 100}% + ${drag}px), 0, 0)`,
          transition: dragging || reduced ? "none" : "transform 760ms var(--ease-out)",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => {
          if (moved.current) {
            e.preventDefault();
            e.stopPropagation();
            moved.current = false;
          }
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <article
              key={slide.id}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${slide.title}`}
              aria-hidden={!active}
              className="relative h-full w-full shrink-0 select-none"
            >
              <div
                className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: active ? "scale(1)" : "scale(1.08)" }}
              >
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 900px, 100vw"
                  className="object-cover"
                  style={slide.position ? { objectPosition: slide.position } : undefined}
                  draggable={false}
                />
              </div>
              <div className="scrim-bottom absolute inset-0" />
              <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/70 via-ink/10 to-transparent sm:block" />

              <div
                key={active ? `on-${index}` : "off"}
                className="absolute inset-x-0 bottom-0 flex flex-col items-start p-5 pb-12 sm:max-w-[36rem] sm:p-8 sm:pb-14 lg:p-10 lg:pb-16"
              >
                <p
                  className={cn("t-eyebrow flex items-center gap-2 !text-fg/80", active && "enter-soft")}
                  style={{ ["--d" as string]: "80ms" }}
                >
                  {slide.live && <span className="live-dot" aria-hidden />}
                  {slide.eyebrow}
                </p>
                <h3
                  className={cn("t-display mt-3 text-balance", active && "enter")}
                  style={{ ["--d" as string]: "160ms" }}
                >
                  {slide.title}
                </h3>
                {slide.description && (
                  <p
                    className={cn("mt-3 max-w-[30ch] text-[15px] leading-snug text-fg-2", active && "enter-soft")}
                    style={{ ["--d" as string]: "260ms" }}
                  >
                    {slide.description}
                  </p>
                )}
                <div
                  className={cn("mt-5 flex flex-wrap items-center gap-2", active && "enter-soft")}
                  style={{ ["--d" as string]: "340ms" }}
                >
                  <Link
                    href={slide.cta.href}
                    tabIndex={active ? 0 : -1}
                    className="pressable inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink"
                  >
                    {slide.cta.label}
                    <ArrowUpRight size={16} aria-hidden />
                  </Link>
                  {slide.secondary && (
                    <Link
                      href={slide.secondary.href}
                      tabIndex={active ? 0 : -1}
                      className="pressable inline-flex h-11 items-center rounded-full border border-white/20 bg-white/[0.06] px-5 text-sm font-semibold text-fg backdrop-blur-md hover:bg-white/10"
                    >
                      {slide.secondary.label}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <div className="absolute inset-x-5 bottom-5 flex items-center gap-1.5 sm:inset-x-8 lg:inset-x-10">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}: ${s.title}`}
                aria-current={i === index}
                onClick={() => {
                  go(i);
                  userInteracted();
                }}
                className="group relative h-6 flex-1 sm:max-w-16"
              >
                <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/20 transition-colors group-hover:bg-white/35">
                  {i < index && <span className="absolute inset-0 bg-fg" />}
                  {i === index && (
                    <span
                      key={`${index}-${playing}`}
                      className="absolute inset-0 origin-left bg-fg"
                      style={
                        playing
                          ? { animation: `fill-x ${interval}ms linear both` }
                          : { transform: "scaleX(1)" }
                      }
                    />
                  )}
                </span>
              </button>
            ))}
          </div>

          <div className="absolute right-6 top-6 hidden gap-2 sm:flex lg:right-8 lg:top-8">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => {
                go(index - 1);
                userInteracted();
              }}
              className="pressable glass flex h-10 w-10 items-center justify-center rounded-full text-fg hover:bg-white/10"
            >
              <ArrowLeft size={17} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => {
                go(index + 1);
                userInteracted();
              }}
              className="pressable glass flex h-10 w-10 items-center justify-center rounded-full text-fg hover:bg-white/10"
            >
              <ArrowRight size={17} aria-hidden />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
