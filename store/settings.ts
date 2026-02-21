"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SettingsState = {
  soundOn: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  highContrast: boolean;
  toggleSound(): void;
  toggleReducedMotion(): void;
  toggleDyslexiaFont(): void;
  toggleHighContrast(): void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundOn: true,
      reducedMotion: false,
      dyslexiaFont: false,
      highContrast: false,
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      toggleReducedMotion: () =>
        set((s) => ({ reducedMotion: !s.reducedMotion })),
      toggleDyslexiaFont: () => set((s) => ({ dyslexiaFont: !s.dyslexiaFont })),
      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
    }),
    {
      name: "mm_settings_v1",
      version: 1,
    }
  )
);
