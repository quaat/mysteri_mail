"use client";

import * as React from "react";

import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprite } from "@/components/Sprite";

export function EvidenceTapePathPuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "EVIDENCE_TAPE_PATH" }>;
  onSubmit: (answer: string[], salt?: number) => void;
}) {
  const { start, target, pickCount, mustUseExactlyPickCount, moveCards } = puzzle.params;
  const [chosen, setChosen] = React.useState<string[]>([]);

  const byId = React.useMemo(
    () => new Map(moveCards.map((c) => [c.id, c] as const)),
    [moveCards]
  );

  const current = chosen.reduce((v, id) => v + (byId.get(id)?.delta ?? 0), start);

  function add(id: string) {
    if (mustUseExactlyPickCount) {
      if (chosen.length >= pickCount) return;
      setChosen((xs) => [...xs, id]);
    } else {
      if (chosen.length >= pickCount) return;
      setChosen((xs) => [...xs, id]);
    }
  }

  function removeAt(index: number) {
    setChosen((xs) => {
      const next = xs.slice();
      next.splice(index, 1);
      return next;
    });
  }

  function clear() {
    setChosen([]);
  }

  const remaining = pickCount - chosen.length;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Start: {start}</Badge>
          <Badge>Target: {target}</Badge>
          <Badge>
            Cards: {chosen.length}/{pickCount}
          </Badge>
          <Badge>Now: {current}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={clear}>🧽 Clear</Button>
          <Button onClick={() => onSubmit(chosen, current)}>✅ Check route</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-[#fffaf0] p-3">
        <p className="text-sm font-extrabold">Your move sequence</p>
        <p className="text-xs text-black/60">
          {mustUseExactlyPickCount
            ? `Use exactly ${pickCount} cards.`
            : `Use up to ${pickCount} cards.`}
          {remaining > 0 ? ` (${remaining} slot${remaining === 1 ? "" : "s"} left)` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: pickCount }).map((_, i) => {
            const id = chosen[i];
            const card = id ? byId.get(id) : undefined;
            return (
              <button
                key={i}
                type="button"
                onClick={() => (id ? removeAt(i) : null)}
                className={
                  "flex min-w-[120px] items-center justify-between gap-2 rounded-2xl border p-3 text-left " +
                  (id ? "border-black/10 bg-white hover:bg-black/5" : "border-dashed border-black/20 bg-black/5")
                }
                aria-label={id ? `Remove ${card?.label ?? id}` : `Empty slot ${i + 1}`}
                title={id ? "Tap to remove" : "Empty slot"}
              >
                <span className="text-sm font-extrabold">{id ? card?.label ?? id : "(empty)"}</span>
                <span className="text-sm font-black text-black/70">
                  {id ? (card?.delta ?? 0) : "…"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-extrabold">Move cards</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {moveCards.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => add(c.id)}
              disabled={chosen.length >= pickCount}
              className="rounded-2xl border border-black/10 bg-white p-2 text-left hover:bg-black/5 disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Sprite spriteKey={c.spriteKey} label={c.label} />
                <div className="grid">
                  <p className="text-sm font-extrabold leading-tight">{c.label}</p>
                  <p className="text-xs text-black/60">Delta: {c.delta}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-[#e8fbff] p-3 text-sm text-black/80">
        <p className="font-bold">Detective brain teaser</p>
        <p>
          From {start} to {target} is {target - start >= 0 ? "+" : ""}
          {target - start}. Can you build that change with your cards?
        </p>
      </div>
    </div>
  );
}
