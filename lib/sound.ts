"use client";

/**
 * Workout audio cues, synthesised with Web Audio so there are no files to load.
 * Browsers only allow sound after a user gesture: call `unlockAudio()` from a tap.
 */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  const c = audio();
  if (!c) return;
  // iOS needs a sound started inside the gesture before later sounds will play.
  const source = c.createBufferSource();
  source.buffer = c.createBuffer(1, 1, 22050);
  source.connect(c.destination);
  source.start(0);
}

function tone(c: AudioContext, freq: number, at: number, length: number, volume: number, type: OscillatorType = "sine") {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain).connect(c.destination);
  osc.start(at);
  osc.stop(at + length + 0.05);
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
}

/** Short tick for the last seconds of a countdown. */
export function playTick() {
  const c = audio();
  if (c) tone(c, 880, c.currentTime, 0.12, 0.28, "triangle");
  vibrate(40);
}

/** Higher, longer tone for "go". */
export function playGo() {
  const c = audio();
  if (c) {
    tone(c, 1320, c.currentTime, 0.35, 0.32, "triangle");
    tone(c, 2640, c.currentTime, 0.2, 0.06);
  }
  vibrate(120);
}

/** Alarm-clock ring for when a timer runs out: two bursts of four beeps. */
export function playAlarm() {
  const c = audio();
  if (c) {
    const start = c.currentTime + 0.02;
    for (let burst = 0; burst < 2; burst++) {
      for (let beep = 0; beep < 4; beep++) {
        const at = start + burst * 0.95 + beep * 0.16;
        tone(c, 1046, at, 0.11, 0.34, "square");
        tone(c, 2093, at, 0.08, 0.05);
      }
    }
  }
  vibrate([220, 90, 220, 90, 220, 300, 220, 90, 220, 90, 220]);
}
