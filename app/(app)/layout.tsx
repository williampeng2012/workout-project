import { AppShell } from "@/components/app-shell";
import { SocialSync } from "@/components/social/social-sync";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <SocialSync />
      {children}
    </AppShell>
  );
}
