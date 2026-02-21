"use client";

import * as React from "react";
import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sfx } from "@/lib/sfx";

function roundToStep(value: number, step: number) {
  if (step === 0) return value;
  const inv = 1 / step;
  return Math.round(value * inv) / inv;
}

function pretty(n: number) {
  // Keep it kid-friendly: avoid scientific notation.
  const s = n.toFixed(4);
  return s.replace(/0+$/, "").replace(/\.$/, "");
}

export function DecimalNumberLinePuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "DECIMAL_NUMBER_LINE" }>;
  onSubmit: (answer: { answers: Record<string, number> }, salt?: number) => void;
}) {
  const rounds = puzzle.params.rounds;
  const [activeId, setActiveId] = React.useState(rounds[0]?.id ?? "");
  const [answers, setAnswers] = React.useState<Record<string, number>>({});

  const active = rounds.find((r) => r.id === activeId) ?? rounds[0];

  const initialValue = React.useMemo(() => {
    if (!active) return 0;
    const existing = answers[active.id];
    if (typeof existing === "number") return existing;
    return roundToStep((active.min + active.max) / 2, active.step);
  }, [active, answers]);

  const [cursor, setCursor] = React.useState<number>(initialValue);

  React.useEffect(() => {
    setCursor(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const lockedCount = Object.keys(answers).length;
  const done = lockedCount === rounds.length;

  function lockIn() {
    if (!active) return;
    sfx.stamp();
    setAnswers((a) => {
      const nextAnswers = { ...a, [active.id]: cursor };

      // Auto-advance to next unfinished round
      const next = rounds.find((r) => typeof nextAnswers[r.id] !== "number" && r.id !== active.id);
      if (next) setActiveId(next.id);

      return nextAnswers;
    });
  }

  function clearThis() {
    if (!active) return;
    setAnswers((a) => {
      const next = { ...a };
      delete next[active.id];
      return next;
    });
  }

  if (!active) return <p>Missing rounds.</p>;

  const mid = (active.min + active.max) / 2;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>
              Round: {rounds.findIndex((r) => r.id === active.id) + 1}/{rounds.length}
            </Badge>
            <Badge>
              Locked: {lockedCount}/{rounds.length}
            </Badge>
          </div>
          <p className="text-sm text-black/70">{active.prompt}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={clearThis}>
            🧼 Un-lock
          </Button>
          <Button onClick={lockIn}>📌 Lock mark</Button>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-extrabold">Number Line Scanner</p>
            <Badge>
              Marker: <span className="ml-1 font-black">{pretty(cursor)}</span>
            </Badge>
          </div>

          <div className="mt-4 grid gap-3">
            <input
              type="range"
              min={active.min}
              max={active.max}
              step={active.step}
              value={cursor}
              onChange={(e) => setCursor(Number(e.target.value))}
              className="w-full"
              aria-label="Decimal marker slider"
            />

            {active.showLabels ? (
              <div className="flex items-center justify-between text-xs text-black/60">
                <span>{pretty(active.min)}</span>
                <span>{pretty(mid)}</span>
                <span>{pretty(active.max)}</span>
              </div>
            ) : null}

            <div className="rounded-2xl border border-black/10 bg-black/5 p-3 text-sm">
              <p className="font-extrabold">Wacky hint</p>
              <p className="text-black/70">Pretend the slider is a tiny detective on a skateboarding ruler.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-3">
          <p className="text-sm font-extrabold">Rounds</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {rounds.map((r, idx) => {
              const locked = typeof answers[r.id] === "number";
              const activeNow = r.id === activeId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveId(r.id)}
                  className={
                    "rounded-full border px-3 py-2 text-sm font-semibold transition " +
                    (activeNow
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white hover:bg-black/5")
                  }
                >
                  {locked ? "✅" : "🕵️"} {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="lg"
          disabled={!done}
          onClick={() => onSubmit({ answers }, lockedCount)}
          title={done ? "Submit your locked marks" : "Lock all rounds first"}
        >
          ✅ Submit all marks
        </Button>
        {!done ? (
          <p className="text-sm text-black/60">Lock every round before submitting.</p>
        ) : null}
      </div>
    </div>
  );
}
