"use client";

import * as React from "react";
import { motion } from "framer-motion";

import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprite } from "@/components/Sprite";

export function PerimeterWalkPuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "PERIMETER_WALK" }>;
  onSubmit: (answer: number, salt?: number) => void;
}) {
  const { segments, unitLabel } = puzzle.params;

  const [counted, setCounted] = React.useState<Record<string, boolean>>({});
  const [value, setValue] = React.useState<string>("");
  const [msg, setMsg] = React.useState<string | null>(null);

  const scratchTotal = React.useMemo(
    () => segments.reduce((acc, s) => acc + (counted[s.id] ? s.length : 0), 0),
    [segments, counted]
  );

  function toggleCount(id: string) {
    setCounted((m) => ({ ...m, [id]: !m[id] }));
  }

  function clearAll() {
    setCounted({});
    setValue("");
    setMsg(null);
  }

  function submit() {
    const n = Number(value);
    if (!Number.isFinite(n)) {
      setMsg("Type a number for the perimeter.");
      return;
    }
    onSubmit(n, scratchTotal);
  }

  // Keyboard support
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") setValue((v) => (v === "0" ? e.key : v + e.key));
      if (e.key === "Backspace") setValue((v) => v.slice(0, -1));
      if (e.key === "Escape") clearAll();
      if (e.key === "Enter") submit();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, scratchTotal]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Scratch total: {scratchTotal} {unitLabel}</Badge>
          <Badge className="hidden md:inline-flex">Goal: compute perimeter (don’t peek!)</Badge>
        </div>
        <Button variant="secondary" onClick={clearAll}>↩️ Reset</Button>
      </div>

      <div className="rounded-2xl border border-black/10 bg-[#fffaf0] p-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🧵</span>
          <div className="grid gap-1">
            <p className="text-sm font-extrabold">Perimeter Walk</p>
            <p className="text-sm text-black/80">
              Walk around the shape and count each side. Tap a segment to add it to your scratch total.
              Then type the <span className="font-extrabold">perimeter</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-extrabold">Fence segments</p>
        <div className="flex flex-wrap gap-2">
          {segments.map((s) => {
            const isOn = !!counted[s.id];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleCount(s.id)}
                className={
                  "flex items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm font-extrabold transition " +
                  (isOn ? "border-green-700/30 bg-green-500/10" : "border-black/10 bg-white hover:bg-black/5")
                }
                aria-pressed={isOn}
              >
                {s.spriteKey ? <Sprite spriteKey={s.spriteKey} className="h-8 w-8 text-base" /> : <span className="text-lg">➡️</span>}
                <span>
                  {s.label}: <span className="tabular-nums">{s.length}</span>
                </span>
                {isOn ? <span className="ml-1">✅</span> : null}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-black/60">Tip: you can tap segments in order like a walking trail.</p>
      </div>

      {msg ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-black/10 bg-black/5 p-3 text-sm font-semibold"
        >
          {msg}
        </motion.div>
      ) : null}

      <div className="grid gap-2">
        <p className="text-sm font-extrabold">Perimeter</p>
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-lg font-black outline-none"
            inputMode="numeric"
            placeholder={`Type perimeter in ${unitLabel}`}
          />
          <Button onClick={submit} size="lg">Submit</Button>
        </div>
      </div>

      <p className="text-xs text-black/60">Keyboard: 0–9, Enter = submit, Backspace = delete, Esc = reset.</p>
    </div>
  );
}
