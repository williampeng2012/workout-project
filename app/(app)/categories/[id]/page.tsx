import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/discover/category-view";
import { CATEGORIES, getCategory } from "@/content/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const category = getCategory(id);
  return category ? { title: category.label, description: category.tagline } : {};
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = getCategory(id);
  if (!category) notFound();
  return <CategoryView id={category.id} />;
}
