import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseDetailView } from "@/components/discover/course-detail-view";
import { COURSES, getCourse } from "@/content/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return COURSES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = getCourse(id);
  return course ? { title: course.title, description: course.tagline } : {};
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getCourse(id)) notFound();
  return <CourseDetailView id={id} />;
}
