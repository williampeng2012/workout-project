import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkoutDetail } from "@/components/programs/workout-detail";
import { LESSONS, getLesson } from "@/content/lessons";

export const dynamicParams = false;

export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lesson = getLesson(id);
  return lesson ? { title: lesson.title } : {};
}

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();

  return <WorkoutDetail lessonId={lesson.id} />;
}
