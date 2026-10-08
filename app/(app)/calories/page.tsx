import type { Metadata } from "next";
import { CaloriesView } from "@/components/calories/calories-view";

export const metadata: Metadata = { title: "Calories" };

export default function CaloriesPage() {
  return <CaloriesView />;
}
