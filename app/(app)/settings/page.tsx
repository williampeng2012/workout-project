"use client";

import {
  Bell,
  CreditCard,
  Database,
  Dumbbell,
  FileText,
  Info,
  LifeBuoy,
  Mail,
  Ruler,
  Shield,
  UserRound,
  Utensils,
} from "lucide-react";
import { dailyTarget } from "@/lib/calories";
import { SETTINGS_SECTIONS, SUPPORT_EMAIL, goalLabel } from "@/components/account/meta";
import { MenuGroup, MenuRow, SectionIntro } from "@/components/account/ui";
import { useAccount } from "@/components/account/use-account";
import { Reveal } from "@/components/ui/reveal";
import { TopBar } from "@/components/ui/top-bar";
import { usePulse } from "@/lib/store/pulse-store";

export default function SettingsPage() {
  const { hydrated, state } = usePulse();
  const { status } = useAccount();
  const s = SETTINGS_SECTIONS;

  const accountLine =
    status.kind === "signed-in"
      ? `Signed in as ${status.email ?? "your account"}`
      : status.kind === "guest"
        ? "Guest mode — progress is saved on this device"
        : status.kind === "signed-out"
          ? "Not signed in"
          : " ";

  const val = <T,>(v: T) => (hydrated ? v : undefined);

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar title="Settings" fallback="/profile" />
      <div className="page-x mx-auto max-w-[1180px]">
        <SectionIntro eyebrow={accountLine} title="Settings" />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-8">
          <div className="space-y-10">
            <Reveal>
              <MenuGroup title="You">
                <MenuRow
                  href="/settings/profile"
                  icon={UserRound}
                  label={s.profile.title}
                  description={val(
                    [state.displayName || "No name yet", goalLabel(state.goal)].filter(Boolean).join(" · "),
                  )}
                />
                <MenuRow
                  href="/settings/training"
                  icon={Dumbbell}
                  label={s.training.title}
                  description={val(`${state.trainingDays ?? 4} days a week`)}
                />
                <MenuRow
                  href="/calories"
                  icon={Utensils}
                  label="Calories & nutrition"
                  description={val(`${dailyTarget(state).kcal.toLocaleString()} kcal daily target`)}
                />
              </MenuGroup>
            </Reveal>
            <Reveal delay={60}>
              <MenuGroup title="App">
                <MenuRow href="/settings/notifications" icon={Bell} label={s.notifications.title} description={s.notifications.description} />
                <MenuRow
                  href="/settings/units"
                  icon={Ruler}
                  label={s.units.title}
                  value={val(state.preferences.units === "metric" ? "Metric" : "Imperial")}
                />
                <MenuRow href="/settings/subscription" icon={CreditCard} label={s.subscription.title} value="Free" />
              </MenuGroup>
            </Reveal>
          </div>

          <div className="space-y-10">
            <Reveal delay={100}>
              <MenuGroup title="Privacy & data">
                <MenuRow href="/settings/data" icon={Database} label={s.data.title} description={s.data.description} />
                <MenuRow href="/legal/privacy" icon={Shield} label="Privacy policy" />
                <MenuRow href="/legal/terms" icon={FileText} label="Terms of service" />
              </MenuGroup>
            </Reveal>
            <Reveal delay={140}>
              <MenuGroup title="Support">
                <MenuRow href="/settings/help" icon={LifeBuoy} label={s.help.title} description={s.help.description} />
                <MenuRow href={`mailto:${SUPPORT_EMAIL}`} icon={Mail} label="Contact support" description={SUPPORT_EMAIL} external />
                <MenuRow href="/settings/about" icon={Info} label={s.about.title} description={s.about.description} />
              </MenuGroup>
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}
