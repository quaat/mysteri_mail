"use client";

import * as React from "react";
import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprite } from "@/components/Sprite";

export function CoinSumPuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "COIN_SUM" }>;
  onSubmit: (answer: string[], salt?: number) => void;
}) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const { coins, targetCents, constraints } = puzzle.params;

  const coinById = React.useMemo(
    () => new Map(coins.map((c) => [c.id, c] as const)),
    [coins]
  );

  const total = selected.reduce((acc, id) => acc + (coinById.get(id)?.valueCents ?? 0), 0);
  const diff = targetCents - total;
  const diffLabel = diff === 0 ? "Exact!" : diff > 0 ? `Need ${diff}¢ more` : `Too much by ${Math.abs(diff)}¢`;

  function add(id: string) {
    if (selected.length >= constraints.maxCoins) return;
    setSelected((xs) => [...xs, id]);
  }

  function removeAt(index: number) {
    setSelected((xs) => {
      const next = xs.slice();
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
            <Badge>Target: {targetCents}¢</Badge>
            <Badge>Max coins: {constraints.maxCoins}</Badge>
            {typeof constraints.bonusFewestCoins === "number" ? (
              <Badge>Bonus ≤ {constraints.bonusFewestCoins}</Badge>
            ) : null}
          </div>
          <p className="text-sm text-black/70">
            Total: <span className="font-extrabold">{total}¢</span> · {diffLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={clear}>🧽 Clear</Button>
          <Button onClick={() => onSubmit(selected, selected.length)}>✅ Pay it!</Button>
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-extrabold">Coin Drawer</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {coins.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => add(c.id)}
              disabled={selected.length >= constraints.maxCoins}
              className="flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fffaf0] p-2 text-left hover:bg-black/5 disabled:opacity-50"
            >
              <Sprite spriteKey={c.spriteKey} label={c.label} />
              <div className="grid">
                <span className="text-sm font-extrabold leading-tight">{c.label}</span>
                <span className="text-xs text-black/60">{c.valueCents}¢</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-extrabold">Your pile of coins</p>
        {selected.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/20 bg-black/5 p-4 text-sm text-black/60">
            Tap coins to add them.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((id, idx) => {
              const c = coinById.get(id);
              return (
                <button
                  key={`${id}-${idx}`}
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/5"
                  title="Tap to remove"
                >
                  <span className="font-extrabold">{c?.valueCents ?? "?"}¢</span>
                  <span className="text-black/70">{c?.label ?? id}</span>
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
