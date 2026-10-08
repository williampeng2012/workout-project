import type { Metadata } from "next";
import { CoursesView } from "@/components/discover/courses-view";

export const metadata: Metadata = { title: "Courses" };

export default function CoursesPage() {
  return <CoursesView />;
}
