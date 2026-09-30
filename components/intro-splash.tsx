"use client";

import { useState, type CSSProperties } from "react";

const WORD = "Pulsepath";
const DEPTH = 14;

/** Runs before first paint so a returning visitor (same tab session) never
 *  sees the splash flash. Paired with `html[data-intro="seen"]` in CSS. */
export const INTRO_GATE_SCRIPT = `try{if(sessionStorage.getItem("pp-intro")){document.documentElement.dataset.intro="seen"}else{sessionStorage.setItem("pp-intro","1")}}catch(e){}`;

/** First-visit brand intro: extruded 3D wordmark that turns while a white
 *  light sweeps across it and leaves it lit. Tap anywhere to skip. */
export function IntroSplash() {
  const [phase, setPhase] = useState<"playing" | "skipping" | "done">("playing");

  if (phase === "done") return null;

  return (
    <div
      className={phase === "skipping" ? "intro is-skipping" : "intro"}
      aria-hidden
      onClick={() => setPhase("skipping")}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) setPhase("done");
      }}
    >
      <div className="intro-stage">
        <div className="intro-rise">
          <div className="intro-sign">
            {Array.from({ length: DEPTH }, (_, i) => (
              <span key={i} className="intro-layer" style={{ "--z": i + 1 } as CSSProperties}>
                {WORD}
              </span>
            ))}
            <span className="intro-face">{WORD}</span>
            <span className="intro-lit">{WORD}</span>
            <span className="intro-shine">{WORD}</span>
          </div>
        </div>
        <span className="intro-bar" />
        <p className="intro-tagline">Train a little, every day</p>
      </div>
      <div className="intro-beam" />
    </div>
  );
}
