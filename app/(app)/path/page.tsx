"use client";

import { BottomNav } from "@/components/bottom-nav";
import { PathMap } from "@/components/path-map";

export default function PathPage() {
  return (
    <>
      <main className="px-5 pb-8 pt-10">
        <p className="text-xs uppercase tracking-[0.25em] text-fg-dim">Path</p>
        <h1 className="font-display mt-1 text-3xl font-bold">Your route</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Unlock nodes one lesson at a time.
        </p>
        <PathMap />
      </main>
      <BottomNav active="/path" />
    </>
  );
}
