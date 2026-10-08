import type { Metadata } from "next";
import { LearnView } from "@/components/discover/learn-view";

export const metadata: Metadata = { title: "Technique library" };

export default function LearnPage() {
  return <LearnView />;
}
