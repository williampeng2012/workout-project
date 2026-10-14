"use client";

import { useState, type FormEvent } from "react";
import { TextField } from "@/components/auth/fields";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics";
import { CM_PER_IN, LB_PER_KG, calculatedTarget, goalAdjustmentLabel } from "@/lib/calories";
import { usePulse, type BodyProfile } from "@/lib/store/pulse-store";

export function TargetSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Daily calorie target"
      description="Used to estimate your needs. Saved on this device only."
    >
      {open && <TargetForm onDone={onClose} />}
    </Sheet>
  );
}

function num(v: string): number {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function TargetForm({ onDone }: { onDone: () => void }) {
  const { state, updateBody, setCalorieTarget } = usePulse();
  const toast = useToast();
  const imperial = state.preferences.units === "imperial";
  const body = state.body;

  const [sex, setSex] = useState<BodyProfile["sex"]>(body?.sex ?? "female");
  const [age, setAge] = useState(body ? String(body.age) : "");
  const [weight, setWeight] = useState(
    body ? String(imperial ? Math.round(body.weightKg * LB_PER_KG) : Math.round(body.weightKg * 10) / 10) : "",
  );
  const [heightCm, setHeightCm] = useState(body ? String(Math.round(body.heightCm)) : "");
  const [feet, setFeet] = useState(body ? String(Math.floor(body.heightCm / CM_PER_IN / 12)) : "");
  const [inches, setInches] = useState(body ? String(Math.round((body.heightCm / CM_PER_IN) % 12)) : "");
  const [mode, setMode] = useState<"calculated" | "custom">(state.calorieTargetOverride ? "custom" : "calculated");
  const [custom, setCustom] = useState(state.calorieTargetOverride ? String(state.calorieTargetOverride) : "");
  const [touched, setTouched] = useState(false);

  const ageN = num(age);
  const weightKg = imperial ? num(weight) / LB_PER_KG : num(weight);
  const heightN = imperial ? (num(feet) * 12 + (num(inches) || 0)) * CM_PER_IN : num(heightCm);
  const customN = num(custom);

  const errors = {
    age: !(ageN >= 14 && ageN <= 100) ? "Age between 14 and 100." : null,
    weight: !(weightKg >= 30 && weightKg <= 300) ? `Weight between ${imperial ? "66–660 lb" : "30–300 kg"}.` : null,
    height: !(heightN >= 120 && heightN <= 230) ? `Height between ${imperial ? "3'11\"–7'6\"" : "120–230 cm"}.` : null,
    custom: mode === "custom" && !(customN >= 800 && customN <= 6000) ? "Target between 800 and 6,000 kcal." : null,
  };
  const bodyValid = !errors.age && !errors.weight && !errors.height;
  const preview = bodyValid
    ? calculatedTarget({ sex, age: ageN, heightCm: heightN, weightKg }, state.goal, state.trainingDays)
    : null;

  function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (mode === "custom" && errors.custom) return;
    if (mode === "calculated" && !bodyValid) return;
    if (bodyValid) {
      updateBody({ sex, age: Math.round(ageN), heightCm: Math.round(heightN), weightKg: Math.round(weightKg * 10) / 10 });
    }
    setCalorieTarget(mode === "custom" ? customN : null);
    track("Calorie Target Set", { mode, kcal: mode === "custom" ? customN : null, body_filled: bodyValid });
    toast("Calorie target saved");
    onDone();
  }

  const show = (k: keyof typeof errors) => (touched ? errors[k] : null);

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Segmented
        label="Target type"
        value={mode}
        onChange={setMode}
        options={[
          { value: "calculated", label: "Calculate for me" },
          { value: "custom", label: "Set my own" },
        ]}
      />

      <fieldset className="space-y-4">
        <legend className="t-eyebrow mb-3">
          Body data {mode === "custom" && <span className="normal-case tracking-normal text-fg-4">· optional, improves burn estimates</span>}
        </legend>
        <Segmented
          label="Sex"
          value={sex}
          onChange={setSex}
          options={[
            { value: "female", label: "Female" },
            { value: "male", label: "Male" },
          ]}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Age" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/[^\d]/g, "").slice(0, 3))} placeholder="30" error={show("age")} />
          <TextField
            label={`Weight (${imperial ? "lb" : "kg"})`}
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value.replace(/[^\d.,]/g, "").slice(0, 5))}
            placeholder={imperial ? "154" : "70"}
            error={show("weight")}
          />
        </div>
        {imperial ? (
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Height (ft)" inputMode="numeric" value={feet} onChange={(e) => setFeet(e.target.value.replace(/[^\d]/g, "").slice(0, 1))} placeholder="5" error={show("height")} />
            <TextField label="Height (in)" inputMode="numeric" value={inches} onChange={(e) => setInches(e.target.value.replace(/[^\d]/g, "").slice(0, 2))} placeholder="7" />
          </div>
        ) : (
          <TextField label="Height (cm)" inputMode="numeric" value={heightCm} onChange={(e) => setHeightCm(e.target.value.replace(/[^\d]/g, "").slice(0, 3))} placeholder="170" error={show("height")} />
        )}
      </fieldset>

      {mode === "custom" ? (
        <TextField
          label="Daily target (kcal)"
          inputMode="numeric"
          value={custom}
          onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
          placeholder={preview ? String(preview.kcal) : "2000"}
          error={show("custom")}
        />
      ) : (
        <div className="surface-paper p-5" aria-live="polite">
          {preview ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/50">Your target</p>
              <p className="t-num mt-2 text-[44px] text-ink">
                {preview.kcal.toLocaleString()} <span className="text-lg text-ink/50">kcal</span>
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink/60">
                Resting {preview.bmr.toLocaleString()} · maintenance {preview.maintenance.toLocaleString()} kcal with{" "}
                {state.trainingDays ?? 3} training days, adjusted for {goalAdjustmentLabel(state.goal)}.
              </p>
            </>
          ) : (
            <p className="text-[13px] text-ink/60">Fill in your details to see a personalised estimate.</p>
          )}
        </div>
      )}

      <Button type="submit" size="lg" block>
        Save target
      </Button>
      <p className="text-center text-[12px] leading-relaxed text-fg-4">
        Estimates use the Mifflin–St Jeor equation. Not medical advice — talk to a professional for specific dietary needs.
      </p>
    </form>
  );
}
