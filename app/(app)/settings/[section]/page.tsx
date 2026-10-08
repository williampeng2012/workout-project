import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SETTINGS_SECTIONS, isSettingsSection } from "@/components/account/meta";
import { SettingsSection } from "@/components/account/settings-sections";
import pkg from "@/package.json";

export const dynamicParams = false;

export const metadata: Metadata = { title: "Settings" };

export function generateStaticParams() {
  return Object.keys(SETTINGS_SECTIONS).map((section) => ({ section }));
}

export default async function SettingsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isSettingsSection(section)) notFound();
  return <SettingsSection section={section} version={pkg.version} />;
}
