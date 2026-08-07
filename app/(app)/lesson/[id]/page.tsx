"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { LessonPlayer } from "@/components/lesson-player";
import { getLesson } from "@/content/lessons";

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lesson = getLesson(id);
  if (!lesson) notFound();

  return (
    <main>
      <LessonPlayer lesson={lesson} />
    </main>
  );
}
