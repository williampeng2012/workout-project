import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClassDetailView } from "@/components/discover/class-detail-view";
import { CLASSES, getClass } from "@/content/classes";

export const dynamicParams = false;

export function generateStaticParams() {
  return CLASSES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cls = getClass(id);
  return cls ? { title: cls.title, description: cls.description } : {};
}

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getClass(id)) notFound();
  return <ClassDetailView id={id} />;
}
