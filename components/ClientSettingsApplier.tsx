"use client";

import * as React from "react";
import { useSettingsStore } from "@/store/settings";
import { cn } from "@/lib/cn";

export function ClientSettingsApplier({ children }: { children: React.ReactNode }) {
  const { dyslexiaFont, highContrast } = useSettingsStore();

  return (
    <div
      className={cn(
        "min-h-dvh",
        dyslexiaFont && "[font-family:ui-rounded,system-ui]",
        highContrast && "bg-black text-white [&_*]:border-white/20"
      )}
    >
      {children}
    </div>
  );
}
