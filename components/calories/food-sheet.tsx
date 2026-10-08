"use client";

import { Camera, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { TextField } from "@/components/auth/fields";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { FOOD_PRESETS, MEALS } from "@/lib/calories";
import { usePulse, type MealType } from "@/lib/store/pulse-store";
import { cn } from "@/lib/cn";

export const SCAN_NOTIFY_ID = "feature-calorie-scan";

export function FoodSheet({
  open,
  onClose,
  day,
  initialMeal,
}: {
  open: boolean;
  onClose: () => void;
  day: string;
  initialMeal: MealType;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Log food" description="Calories are approximate — adjust to match your portion.">
      {open && <FoodForm key={`${day}-${initialMeal}`} day={day} initialMeal={initialMeal} onDone={onClose} />}
    </Sheet>
  );
}

function FoodForm({ day, initialMeal, onDone }: { day: string; initialMeal: MealType; onDone: () => void }) {
  const { addFood, state, toggleNotify } = usePulse();
  const toast = useToast();
  const [meal, setMeal] = useState<MealType>(initialMeal);
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [touched, setTouched] = useState(false);

  const kcalNum = Number(kcal);
  const nameError = touched && !name.trim() ? "Name the food." : null;
  const kcalError =
    touched && (!kcal || !Number.isFinite(kcalNum) || kcalNum <= 0)
      ? "Enter calories above 0."
      : touched && kcalNum > 5000
        ? "That's more than 5,000 kcal — split it into items."
        : null;
  const scanRequested = state.notifyRequests.includes(SCAN_NOTIFY_ID);
  const presets = [...FOOD_PRESETS].sort((a, b) => Number(b.meal === meal) - Number(a.meal === meal));

  function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    const entry = addFood({ name, kcal: kcalNum, meal }, day);
    if (!entry) return;
    toast(`${entry.name} · ${entry.kcal} kcal added`);
    onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Segmented
        label="Meal"
        value={meal}
        onChange={setMeal}
        options={MEALS.map((m) => ({ value: m.id, label: m.label }))}
      />

      <div>
        <p className="t-eyebrow mb-2.5">Quick add</p>
        <div className="rail !gap-2 !py-0.5">
          {presets.map((p) => {
            const on = name === p.name && kcal === String(p.kcal);
            return (
              <button
                key={p.name}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setName(p.name);
                  setKcal(String(p.kcal));
                }}
                className={cn(
                  "pressable flex shrink-0 flex-col items-start rounded-[var(--radius)] border px-3.5 py-2.5 text-left",
                  on ? "border-fg bg-fg text-ink" : "border-line-2 bg-white/[0.03] hover:border-white/25",
                )}
              >
                <span className="whitespace-nowrap text-[13px] font-semibold">{p.name}</span>
                <span className={cn("text-[12px] tabular-nums", on ? "text-ink/60" : "text-fg-3")}>{p.kcal} kcal</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_120px] gap-3">
        <TextField
          label="Food"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chicken wrap"
          maxLength={60}
          error={nameError}
        />
        <TextField
          label="Calories"
          value={kcal}
          onChange={(e) => setKcal(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
          inputMode="numeric"
          placeholder="kcal"
          error={kcalError}
        />
      </div>

      <Button type="submit" size="lg" block icon={<Plus size={17} aria-hidden />}>
        Add to {MEALS.find((m) => m.id === meal)?.label.toLowerCase()}
      </Button>

      <div className="flex items-center gap-3 rounded-[var(--radius)] border border-dashed border-line-2 p-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-fg-2">
          <Camera size={18} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold">Scan a meal with your camera</p>
          <p className="text-[12.5px] text-fg-3">Photo recognition is coming soon.</p>
        </div>
        <button
          type="button"
          aria-pressed={scanRequested}
          onClick={() => {
            const on = toggleNotify(SCAN_NOTIFY_ID);
            toast(on ? "We'll let you know when meal scanning launches" : "Notification removed", on ? "success" : "info");
          }}
          className={cn(
            "pressable h-9 shrink-0 rounded-full px-3.5 text-[13px] font-semibold",
            scanRequested ? "bg-fg text-ink" : "border border-line-2 text-fg hover:border-white/30",
          )}
        >
          {scanRequested ? "Notifying" : "Notify me"}
        </button>
      </div>
    </form>
  );
}
