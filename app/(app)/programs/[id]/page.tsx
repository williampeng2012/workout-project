import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramDetail } from "@/components/programs/program-detail";
import { ComingSoon } from "@/components/ui/states";
import { PROGRAMS, getProgram } from "@/content/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const program = getProgram(id);
  return program ? { title: program.title, description: program.description } : {};
}

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = getProgram(id);
  if (!program) notFound();

  if (program.status === "coming-soon") {
    return (
      <ComingSoon
        id={`program-${program.id}`}
        eyebrow="Program · Coming soon"
        title={program.title}
        description={program.description}
        image={program.image}
        fallback="/programs"
        details={[
          { label: "Level", value: program.level },
          { label: "Length", value: `${program.weeks} weeks` },
          { label: "Coach", value: program.coach },
        ]}
        primary={{ label: "Browse programs", href: "/programs" }}
      />
    );
  }

  return <ProgramDetail programId={program.id} />;
}
