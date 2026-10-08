"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { usePulse } from "@/lib/store/pulse-store";

/** Renders a trigger (via render prop) and the confirmation sheet for wiping local data. */
export function ResetDemo({
  children,
}: {
  children: (open: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { resetDemo, state } = usePulse();
  const toast = useToast();
  const router = useRouter();
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {children(() => setOpen(true))}
      <Sheet
        open={open}
        onClose={close}
        title="Reset demo data?"
        description="This clears everything Pulsepath has stored on this device and takes you back to onboarding."
      >
        <ul className="mb-6 space-y-2 text-[13.5px] text-fg-2">
          <li className="flex justify-between border-b border-line pb-2">
            <span>XP earned</span>
            <span className="font-semibold tabular-nums text-fg">{state.xp}</span>
          </li>
          <li className="flex justify-between border-b border-line pb-2">
            <span>Current streak</span>
            <span className="font-semibold tabular-nums text-fg">{state.streakCount} days</span>
          </li>
          <li className="flex justify-between">
            <span>Workouts completed</span>
            <span className="font-semibold tabular-nums text-fg">
              {Object.keys(state.lessonProgress).length}
            </span>
          </li>
        </ul>
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={close}>
            Keep my data
          </Button>
          <Button
            variant="light"
            icon={<RotateCcw size={16} aria-hidden />}
            onClick={() => {
              resetDemo();
              setOpen(false);
              toast("Demo data reset", "info");
              router.push("/onboarding");
            }}
          >
            Reset everything
          </Button>
        </div>
      </Sheet>
    </>
  );
}
