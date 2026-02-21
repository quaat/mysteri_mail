"use client";

import { Howl } from "howler";
import { useSettingsStore } from "@/store/settings";

// Optional: if you add actual audio files later, put them in `public/sfx/` and update the paths.
// `preload: false` prevents noisy 404s until you actually call play().
const sounds = {
  stamp: new Howl({ src: ["/sfx/stamp.mp3"], volume: 0.5, preload: false }),
  success: new Howl({ src: ["/sfx/success.mp3"], volume: 0.5, preload: false }),
  fail: new Howl({ src: ["/sfx/fail.mp3"], volume: 0.4, preload: false }),
};

function beep(freq: number, durationMs: number) {
  try {
    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as
      | typeof AudioContext
      | undefined;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.type = "triangle";
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close().catch(() => {});
    }, durationMs);
  } catch {
    // ignore
  }
}

function safePlay(key: keyof typeof sounds, fallbackFreq: number) {
  const { soundOn } = useSettingsStore.getState();
  if (!soundOn) return;

  // Always provide a tiny synthetic confirmation tone.
  beep(fallbackFreq, 90);

  // Try to play the real file if present.
  try {
    sounds[key].play();
  } catch {
    // ignore
  }
}

export const sfx = {
  stamp: () => safePlay("stamp", 330),
  success: () => safePlay("success", 520),
  fail: () => safePlay("fail", 180),
};
