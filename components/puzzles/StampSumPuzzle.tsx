"use client";

import * as React from "react";
import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprite } from "@/components/Sprite";
import { sfx } from "@/lib/sfx";

export function StampSumPuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "STAMP_SUM" }>;
  onSubmit: (answer: string[], salt?: number) => void;
}) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const { stamps, targetCents, constraints } = puzzle.params;

  const stampById = React.useMemo(
    () => new Map(stamps.map((s) => [s.id, s] as const)),
    [stamps]
  );

  const total = selected.reduce((acc, id) => acc + (stampById.get(id)?.valueCents ?? 0), 0);

  const warning = React.useMemo(() => {
    for (const id of selected) {
      const st = stampById.get(id);
      if (st?.requiresStampId && !selected.includes(st.requiresStampId)) {
        const req = stampById.get(st.requiresStampId);
        return `${st.label} demands: ${req?.label ?? st.requiresStampId}`;
      }
    }
    return null;
  }, [selected, stampById]);

  function addStamp(id: string) {
    if (selected.length >= constraints.maxStamps) return;
    const st = stampById.get(id);
    const next = [...selected, id];

    // Auto-add required friend if it fits
    if (st?.requiresStampId && !next.includes(st.requiresStampId) && next.length < constraints.maxStamps) {
      next.push(st.requiresStampId);
    }

    sfx.stamp();
    setSelected(next);
  }

  function removeAt(index: number) {
    const next = selected.slice();
    next.splice(index, 1);
    setSelected(next);
  }

  function clear() {
    setSelected([]);
  }

  const diff = targetCents - total;
  const diffLabel = diff === 0 ? "Perfect!" : diff > 0 ? `Need ${diff}¢ more` : `Too much by ${Math.abs(diff)}¢`;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <Badge>Target: {targetCents}¢</Badge>
            <Badge>Max stamps: {constraints.maxStamps}</Badge>
            {typeof constraints.bonusFewestStamps === "number" ? (
              <Badge>Bonus ≤ {constraints.bonusFewestStamps} stamps</Badge>
            ) : null}
          </div>
          <p className="text-sm text-black/70">Current total: <span className="font-extrabold">{total}¢</span> · {diffLabel}</p>
          {warning ? (
            <p className="text-sm font-semibold text-black/80">⚠️ {warning}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={clear}>🧽 Clear</Button>
          <Button onClick={() => onSubmit(selected, selected.length)}>✅ Stamp it!</Button>
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-extrabold">Stamp Tray</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {stamps.map((s) => (
            <button
              key={s.id}
              onClick={() => addStamp(s.id)}
              className="flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fffaf0] p-2 text-left hover:bg-black/5 disabled:opacity-50"
              disabled={selected.length >= constraints.maxStamps}
              type="button"
            >
              <Sprite spriteKey={s.spriteKey} label={s.label} />
              <div className="grid">
                <span className="text-sm font-extrabold leading-tight">{s.label}</span>
                <span className="text-xs text-black/60">Value: {s.valueCents}¢</span>
                {s.requiresStampId ? (
                  <span className="text-xs font-semibold text-black/70">Requires a friend</span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-extrabold">Envelope (your chosen stamps)</p>
        {selected.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/20 bg-black/5 p-4 text-sm text-black/60">
            No stamps yet. Tap stamps to add them.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((id, idx) => {
              const s = stampById.get(id);
              return (
                <button
                  key={`${id}-${idx}`}
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/5"
                  aria-label={`Remove ${s?.label ?? id}`}
                  title="Tap to remove"
                >
                  <span className="font-extrabold">{s?.valueCents ?? "?"}¢</span>
                  <span className="text-black/70">{s?.label ?? id}</span>
                  <span className="text-black/40">✖</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
