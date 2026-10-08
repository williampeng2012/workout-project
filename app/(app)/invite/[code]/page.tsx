import type { Metadata } from "next";
import { InviteAccept } from "@/components/social/invite-accept";

export const metadata: Metadata = { title: "Friend invite" };

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <InviteAccept code={code} />;
}
