import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchFallback, SearchView } from "@/components/discover/search-view";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchView />
    </Suspense>
  );
}
