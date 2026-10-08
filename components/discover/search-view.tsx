"use client";

import { ArrowUpLeft, Clock, Search, SearchX, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { RowCard } from "@/components/cards";
import { BackButton } from "@/components/ui/back-button";
import { IconButton } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { Enter, Reveal } from "@/components/ui/reveal";
import { ChipGroup } from "@/components/ui/segmented";
import { Pill } from "@/components/ui/section";
import { EmptyState, Skeleton } from "@/components/ui/states";
import {
  CATEGORIES,
  SEARCH_SUGGESTIONS,
  searchCatalog,
  type SearchResult,
} from "@/content/catalog";
import { usePulse } from "@/lib/store/pulse-store";
import { cn } from "@/lib/cn";

type Kind = SearchResult["kind"];

const KIND_ORDER: Kind[] = ["Workout", "Program", "Tutorial", "Class", "Course"];
const KIND_LABELS: Record<Kind, string> = {
  Workout: "Workouts",
  Program: "Programs",
  Tutorial: "Technique",
  Class: "Classes",
  Course: "Courses",
};

function searchHref(q: string) {
  const trimmed = q.trim();
  return trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search";
}

export function SearchView() {
  const router = useRouter();
  const params = useSearchParams();
  const urlQuery = params.get("q") ?? "";
  const { hydrated, state, pushRecentSearch, clearRecentSearches } = usePulse();

  const [query, setQuery] = useState(urlQuery);
  const [seenUrlQuery, setSeenUrlQuery] = useState(urlQuery);
  const [kind, setKind] = useState<"All" | Kind>("All");
  const inputRef = useRef<HTMLInputElement>(null);

  // Back/forward or an external link changed ?q= — adopt it.
  if (urlQuery !== seenUrlQuery) {
    setSeenUrlQuery(urlQuery);
    if (urlQuery !== query.trim()) setQuery(urlQuery);
  }

  const deferred = useDeferredValue(query);
  const trimmed = deferred.trim();
  const results = useMemo(() => searchCatalog(deferred), [deferred]);
  const groups = useMemo(
    () =>
      KIND_ORDER.map((k) => ({ kind: k, items: results.filter((r) => r.kind === k) })).filter(
        (g) => g.items.length > 0,
      ),
    [results],
  );
  const activeKind = kind !== "All" && groups.some((g) => g.kind === kind) ? kind : "All";
  const visibleGroups = activeKind === "All" ? groups : groups.filter((g) => g.kind === activeKind);

  /** Our own URL writes are marked as seen so they never overwrite typing. */
  const replaceUrl = useCallback(
    (q: string) => {
      setSeenUrlQuery(q.trim());
      router.replace(searchHref(q), { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Keep ?q= in sync while typing (debounced, no history entries).
  useEffect(() => {
    const t = window.setTimeout(() => {
      const current = new URLSearchParams(window.location.search).get("q") ?? "";
      if (current !== query.trim()) replaceUrl(query);
    }, 250);
    return () => window.clearTimeout(t);
  }, [query, replaceUrl]);

  const run = (q: string) => {
    setQuery(q);
    pushRecentSearch(q);
    replaceUrl(q);
    inputRef.current?.blur();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    pushRecentSearch(query);
    replaceUrl(query);
    inputRef.current?.blur();
  };

  return (
    <main className="page-bottom min-h-dvh">
      <header
        className="sticky top-0 z-40 border-b border-line bg-ink/80 backdrop-blur-xl backdrop-saturate-150"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <div className="page-x mx-auto flex h-[68px] max-w-[1180px] items-center gap-2 sm:gap-3">
          <BackButton fallback="/discover" variant="plain" />
          <form role="search" onSubmit={onSubmit} className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-3"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Workouts, classes, techniques…"
              aria-label="Search Pulsepath"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 w-full rounded-full border border-line-2 bg-surface-1 pl-11 pr-12 text-[15px] text-fg outline-none transition-colors duration-200 placeholder:text-fg-3 focus:border-white/30 focus:bg-surface-2 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <IconButton
                label="Clear search"
                variant="plain"
                className="absolute right-1 top-1/2 !h-10 !w-10 -translate-y-1/2"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
              >
                <X size={16} aria-hidden />
              </IconButton>
            )}
          </form>
        </div>
      </header>

      <div className="page-x mx-auto max-w-[1180px] pt-8">
        {!trimmed ? (
          <>
            <Enter>
              <h1 className="t-display max-w-[14ch] text-balance">What are we training?</h1>
            </Enter>

            {hydrated && state.recentSearches.length > 0 && (
              <Enter delay={100} as="section" className="mt-10" aria-label="Recent searches">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="t-eyebrow">Recent</h2>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="pressable text-[13px] font-semibold text-fg-2 hover:text-fg"
                  >
                    Clear
                  </button>
                </div>
                <ul className="divide-y divide-line border-y border-line">
                  {state.recentSearches.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => run(s)}
                        className="group pressable flex h-14 w-full items-center gap-3 text-left text-[15px] font-medium text-fg-2 hover:text-fg"
                      >
                        <Clock size={16} className="shrink-0 text-fg-3" aria-hidden />
                        <span className="min-w-0 flex-1 truncate">{s}</span>
                        <ArrowUpLeft
                          size={16}
                          className="shrink-0 text-fg-3 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </Enter>
            )}

            <Enter delay={160} as="section" className="mt-10">
              <h2 className="t-eyebrow mb-3">Popular</h2>
              <SuggestionChips onPick={run} />
            </Enter>

            <Reveal as="section" className="mt-12">
              <h2 className="t-eyebrow mb-3">Browse by focus</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.id}
                    href={`/categories/${c.id}`}
                    transitionTypes={["nav-forward"]}
                    className="group pressable relative aspect-[16/10] overflow-hidden rounded-[var(--radius)] bg-surface-1"
                  >
                    <Media
                      src={c.image}
                      alt=""
                      zoom
                      vtName={`category-${c.id}`}
                      sizes="(min-width:640px) 33vw, 50vw"
                      className="absolute inset-0"
                      imgClassName="grayscale-[25%]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
                    <p className="absolute bottom-3 left-4 font-display text-xl font-extrabold uppercase leading-none [font-stretch:78%]">
                      {c.label}
                    </p>
                  </Link>
                ))}
              </div>
            </Reveal>
          </>
        ) : results.length === 0 ? (
          <Enter className="mx-auto max-w-lg pt-6">
            <h1 className="sr-only">No results</h1>
            <EmptyState
              icon={<SearchX size={20} aria-hidden />}
              title={`Nothing for “${trimmed}”`}
              description="Try a broader word — a muscle, a category or a coach's name. Or start from one of these:"
              action={{ label: "Browse Discover", href: "/discover" }}
            />
            <div className="mt-6 flex justify-center">
              <SuggestionChips onPick={run} className="justify-center" />
            </div>
          </Enter>
        ) : (
          <>
            <Enter variant="enter-soft">
              <p className="t-eyebrow">
                {results.length} result{results.length === 1 ? "" : "s"}
              </p>
              <h1 className="t-title mt-2 truncate">“{trimmed}”</h1>
            </Enter>

            {groups.length > 1 && (
              <Enter variant="enter-soft" delay={60} className="mt-5">
                <ChipGroup
                  label="Filter results"
                  value={activeKind}
                  onChange={setKind}
                  options={[
                    { value: "All", label: "All" },
                    ...groups.map((g) => ({ value: g.kind, label: `${KIND_LABELS[g.kind]} ${g.items.length}` })),
                  ]}
                />
              </Enter>
            )}

            <div className="mt-8 space-y-10">
              {visibleGroups.map((g, gi) => (
                <Enter key={`${trimmed}-${g.kind}`} variant="enter-soft" delay={80 + gi * 60} as="section">
                  <h2 className="t-eyebrow mb-3 flex items-center gap-2">
                    {KIND_LABELS[g.kind]}
                    <span className="tabular-nums text-fg-4">{g.items.length}</span>
                  </h2>
                  <ul className="grid gap-2.5 md:grid-cols-2">
                    {g.items.map((r) => (
                      <li key={r.id} onClick={() => pushRecentSearch(trimmed)}>
                        <RowCard
                          href={r.href}
                          image={r.image}
                          title={r.title}
                          subtitle={r.subtitle}
                          eyebrow={
                            r.subtitle === "Coming soon" ? (
                              <Pill tone="light">Soon</Pill>
                            ) : undefined
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </Enter>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function SuggestionChips({ onPick, className }: { onPick: (q: string) => void; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {SEARCH_SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="pressable h-10 rounded-full border border-line-2 px-4 text-[14px] font-semibold text-fg-2 hover:border-white/30 hover:text-fg"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export function SearchFallback() {
  return (
    <main className="page-bottom min-h-dvh" aria-busy="true" aria-label="Loading search">
      <div style={{ paddingTop: "var(--safe-top)" }} className="border-b border-line">
        <div className="page-x mx-auto flex h-[68px] max-w-[1180px] items-center gap-3">
          <Skeleton className="h-10 w-10 !rounded-full" />
          <Skeleton className="h-12 flex-1 !rounded-full" />
        </div>
      </div>
      <div className="page-x mx-auto max-w-[1180px] pt-8">
        <Skeleton className="h-14 w-3/4 max-w-md" />
        <Skeleton className="mt-10 h-4 w-20" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-10 w-20 !rounded-full" />
          <Skeleton className="h-10 w-24 !rounded-full" />
          <Skeleton className="h-10 w-16 !rounded-full" />
        </div>
      </div>
    </main>
  );
}
