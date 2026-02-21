"use client";

import * as React from "react";

import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprite } from "@/components/Sprite";
import { sfx } from "@/lib/sfx";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function FractionPieSumPuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "FRACTION_PIE_SUM" }>;
  onSubmit: (answer: string[], salt?: number) => void;
}) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const { denominator, targetNumerator, slices, constraints } = puzzle.params;

  const byId = React.useMemo(() => new Map(slices.map((s) => [s.id, s] as const)), [slices]);

  const totalNum = selected.reduce((acc, id) => acc + (byId.get(id)?.numerator ?? 0), 0);
  const pct = clamp((totalNum / denominator) * 100, 0, 100);
  const targetPct = clamp((targetNumerator / denominator) * 100, 0, 100);
  const diff = targetNumerator - totalNum;
  const diffLabel = diff === 0 ? "Perfect!" : diff > 0 ? `Need ${diff}/${denominator} more` : `Too much by ${Math.abs(diff)}/${denominator}`;

  function addSlice(id: string) {
    if (selected.length >= constraints.maxSlices) return;
    sfx.stamp();
    setSelected((s) => [...s, id]);
  }

  function removeAt(index: number) {
    setSelected((s) => {
      const next = s.slice();
      next.splice(index, 1);
      return next;
    });
  }

  function clear() {
    setSelected([]);
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>
              Target: {targetNumerator}/{denominator}
            </Badge>
            <Badge>Max slices: {constraints.maxSlices}</Badge>
            {typeof constraints.bonusFewestSlices === "number" ? (
              <Badge>Bonus ≤ {constraints.bonusFewestSlices} slices</Badge>
            ) : null}
          </div>
          <p className="text-sm text-black/70">
            Current: <span className="font-extrabold">{totalNum}/{denominator}</span> · {diffLabel}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={clear}>
            🧽 Clear
          </Button>
          <Button onClick={() => onSubmit(selected, selected.length)}>✅ Serve the pie!</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-sm font-extrabold">Pie-o-Meter</p>
          <p className="text-xs text-black/60">Fill the pie to exactly the target fraction. Do not anger the Pie Spirits.</p>

          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-32 w-32 rounded-full border border-black/10"
              style={{
                background: `conic-gradient(rgba(0,0,0,0.75) 0 ${pct}%, rgba(0,0,0,0.08) ${pct}% 100%)`,
              }}
              aria-label={`Pie filled to ${Math.round(pct)} percent`}
            >
              <div className="absolute inset-3 rounded-full border border-black/10 bg-white" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid place-items-center">
                  <p className="text-xs font-semibold text-black/60">Filled</p>
                  <p className="text-lg font-black">{Math.round(pct)}%</p>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="rounded-2xl border border-black/10 bg-[#fffaf0] p-3 text-sm">
                <p className="font-extrabold">Target</p>
                <p className="text-black/70">
                  {targetNumerator}/{denominator} (≈ {Math.round(targetPct)}%)
                </p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-black/5 p-3 text-sm">
                <p className="font-extrabold">Tip</p>
                <p className="text-black/70">Try a big slice first, then adjust with smaller ones.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <p className="text-sm font-extrabold">Slice Tray (tap to add)</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slices.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => addSlice(s.id)}
                className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white p-2 text-left hover:bg-black/5 disabled:opacity-50"
                disabled={selected.length >= constraints.maxSlices}
              >
                <Sprite spriteKey={s.spriteKey} label={s.label} />
                <div className="grid">
                  <span className="text-sm font-extrabold leading-tight">{s.label}</span>
                  <span className="text-xs text-black/60">Adds {s.numerator}/{denominator}</span>
                </div>
              </button>
            ))}
          </div>

          <p className="pt-2 text-sm font-extrabold">Plate (tap a slice to remove)</p>
          {selected.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/20 bg-black/5 p-4 text-sm text-black/60">
              No slices yet. The pie is currently an idea.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selected.map((id, idx) => {
                const s = byId.get(id);
                return (
                  <button
                    key={`${id}-${idx}`}
                    type="button"
                    onClick={() => removeAt(idx)}
                    className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/5"
                    aria-label={`Remove ${s?.label ?? id}`}
                    title="Tap to remove"
                  >
                    <span className="font-extrabold">
                      {s?.numerator ?? "?"}/{denominator}
                    </span>
                    <span className="text-black/70">{s?.label ?? id}</span>
                    <span className="text-black/40">✖</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
