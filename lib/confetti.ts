"use client";

import confetti from "canvas-confetti";
import { useSettingsStore } from "@/store/settings";

export function popConfetti() {
  const { reducedMotion } = useSettingsStore.getState();
  if (reducedMotion) return;
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
  });
}
