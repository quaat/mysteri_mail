"use client";

import * as React from "react";
import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprite } from "@/components/Sprite";
import { sfx } from "@/lib/sfx";

export function PercentSprinklePuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "PERCENT_SPRINKLE" }>;
  onSubmit: (answer: string[], salt?: number) => void;
}) {
  const { totalItems, targetPercent, requiredCount, itemSpriteKey, itemLabelSingular, itemLabelPlural, gridCols } =
    puzzle.params;

  const ids = React.useMemo(() => Array.from({ length: totalItems }, (_, i) => `i${i}`), [totalItems]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const count = selected.size;
  const diff = requiredCount - count;
  const status = diff === 0 ? "Perfect!" : diff > 0 ? `Paint ${diff} more` : `Unpaint ${Math.abs(diff)}`;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        sfx.stamp();
      }
      return next;
    });
  }

  function clear() {
    setSelected(new Set());
  }

  const label = requiredCount === 1 ? itemLabelSingular : itemLabelPlural;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Target: {targetPercent}%</Badge>
            <Badge>
              Need: {requiredCount} {label}
            </Badge>
            <Badge>Total: {totalItems}</Badge>
          </div>
          <p className="text-sm text-black/70">
            Painted: <span className="font-extrabold">{count}</span> · {status}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={clear}>
            🧽 Clear
          </Button>
          <Button onClick={() => onSubmit(Array.from(selected), count)}>✅ Submit paint job</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-3">
        <p className="text-sm font-extrabold">Sprinkle Board</p>
        <p className="text-xs text-black/60">
          Tap items to paint them. (Warning: the paint is emotionally clingy.)
        </p>

        <div
          className="mt-3 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
        >
          {ids.map((id) => {
            const on = selected.has(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className={
                  "grid place-items-center rounded-2xl border p-2 transition " +
                  (on ? "border-black bg-black text-white" : "border-black/10 bg-white hover:bg-black/5")
                }
                aria-pressed={on}
                aria-label={on ? "Painted" : "Unpainted"}
              >
                <Sprite
                  spriteKey={itemSpriteKey}
                  label={label}
                  className={on ? "bg-white/10 border-white/20 text-white" : ""}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-3 rounded-2xl border border-black/10 bg-[#fffaf0] p-3 text-sm">
          <p className="font-extrabold">How to think about it</p>
          <p className="text-black/70">
            {targetPercent}% means “out of 100.” Here it’s out of {totalItems}. So you want {requiredCount} out of {totalItems}.
          </p>
        </div>
      </div>
    </div>
  );
}
