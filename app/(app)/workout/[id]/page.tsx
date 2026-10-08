import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExercisePlayerRoute } from "@/components/exercise-player";
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
  return exercise ? { title: exercise.name } : {};
}

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exercise = getExercise(id);
  if (!exercise) notFound();

  return <ExercisePlayerRoute exercise={exercise} />;
}
