import { PageSkeleton } from "@/components/ui/states";

export default function Loading() {
  return (
    <main className="page-bottom min-h-dvh pt-[var(--safe-top)]">
      <PageSkeleton />
    </main>
  );
}
