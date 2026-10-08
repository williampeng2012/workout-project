import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonPlayerRoute } from "@/components/lesson-player";
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

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();

  return <LessonPlayerRoute lesson={lesson} />;
}
