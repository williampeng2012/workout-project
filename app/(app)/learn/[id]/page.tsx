import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExerciseDetailView } from "@/components/discover/exercise-detail-view";
import { EXERCISES, getExercise } from "@/content/exercises";

export const dynamicParams = false;

export function generateStaticParams() {
  return EXERCISES.map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const exercise = getExercise(id);
  return exercise
    ? { title: exercise.name, description: `${exercise.name} technique: ${exercise.muscles.join(", ")}.` }
    : {};
}

export default async function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getExercise(id)) notFound();
  return <ExerciseDetailView id={id} />;
}
