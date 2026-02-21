"use client";

import * as React from "react";

import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sfx } from "@/lib/sfx";

type Match = { fractionId: string; decimalId: string; percentId: string };

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const rnd = mulberry32(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function FdpTrioMatchPuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "FDP_TRIO_MATCH" }>;
  onSubmit: (answer: { matches: Match[] }, salt?: number) => void;
}) {
  const trios = puzzle.params.trios;
  const seed = puzzle.params.shuffleSeed ?? puzzle.seed;

  const fractions = React.useMemo(
    () => trios.map((t) => ({ id: t.fraction.id, label: t.fraction.label, trioId: t.id })),
    [trios]
  );
  const decimals = React.useMemo(
    () => shuffle(trios.map((t) => ({ id: t.decimal.id, label: t.decimal.label, trioId: t.id })), seed + 11),
    [trios, seed]
  );
  const percents = React.useMemo(
    () => shuffle(trios.map((t) => ({ id: t.percent.id, label: t.percent.label, trioId: t.id })), seed + 29),
    [trios, seed]
  );

  const byFractionId = React.useMemo(
    () => new Map(trios.map((t) => [t.fraction.id, t] as const)),
    [trios]
  );

  const [pick, setPick] = React.useState<{ f?: string; d?: string; p?: string }>({});
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [localMsg, setLocalMsg] = React.useState<string | null>(null);

  const usedFractions = new Set(matches.map((m) => m.fractionId));
  const usedDecimals = new Set(matches.map((m) => m.decimalId));
  const usedPercents = new Set(matches.map((m) => m.percentId));

  const done = matches.length === trios.length;

  function pinMatch() {
    if (!pick.f || !pick.d || !pick.p) return;

    const trio = byFractionId.get(pick.f);
    if (!trio) {
      setLocalMsg("That fraction card doesn’t belong to this universe.");
      sfx.fail();
      return;
    }

    const ok = trio.decimal.id === pick.d && trio.percent.id === pick.p;
    if (!ok) {
      setLocalMsg("BONK! Those don’t match. (The cards hiss politely.)");
      sfx.fail();
      return;
    }

    sfx.success();
    setLocalMsg("Pinned! The trio is now legally married.");
    setMatches((m) => [...m, { fractionId: pick.f!, decimalId: pick.d!, percentId: pick.p! }]);
    setPick({});
  }

  function undoLast() {
    setMatches((m) => m.slice(0, -1));
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>
              Pinned: {matches.length}/{trios.length}
            </Badge>
            <Badge>Rule: no card can be used twice</Badge>
          </div>
          <p className="text-sm text-black/70">Build trios: Fraction ↔ Decimal ↔ Percent. The truth is three-headed.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={undoLast} disabled={matches.length === 0}>
            ↩️ Undo
          </Button>
          <Button onClick={pinMatch} disabled={!pick.f || !pick.d || !pick.p}>
            📌 Pin trio
          </Button>
        </div>
      </div>

      {localMsg ? (
        <div className="rounded-2xl border border-black/10 bg-black/5 p-3 text-sm font-semibold">{localMsg}</div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-3">
          <p className="text-sm font-extrabold">Fractions</p>
          <div className="mt-2 grid gap-2">
            {fractions.map((c) => {
              const used = usedFractions.has(c.id);
              const selected = pick.f === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={used}
                  onClick={() => setPick((p) => ({ ...p, f: c.id }))}
                  className={
                    "rounded-2xl border p-3 text-left transition disabled:opacity-40 " +
                    (selected
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white hover:bg-black/5")
                  }
                >
                  <p className="text-lg font-black">{c.label}</p>
                  <p className={"text-xs " + (selected ? "text-white/80" : "text-black/60")}>Tap to pick</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-3">
          <p className="text-sm font-extrabold">Decimals</p>
          <div className="mt-2 grid gap-2">
            {decimals.map((c) => {
              const used = usedDecimals.has(c.id);
              const selected = pick.d === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={used}
                  onClick={() => setPick((p) => ({ ...p, d: c.id }))}
                  className={
                    "rounded-2xl border p-3 text-left transition disabled:opacity-40 " +
                    (selected
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white hover:bg-black/5")
                  }
                >
                  <p className="text-lg font-black">{c.label}</p>
                  <p className={"text-xs " + (selected ? "text-white/80" : "text-black/60")}>Tap to pick</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-3">
          <p className="text-sm font-extrabold">Percents</p>
          <div className="mt-2 grid gap-2">
            {percents.map((c) => {
              const used = usedPercents.has(c.id);
              const selected = pick.p === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={used}
                  onClick={() => setPick((p) => ({ ...p, p: c.id }))}
                  className={
                    "rounded-2xl border p-3 text-left transition disabled:opacity-40 " +
                    (selected
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white hover:bg-black/5")
                  }
                >
                  <p className="text-lg font-black">{c.label}</p>
                  <p className={"text-xs " + (selected ? "text-white/80" : "text-black/60")}>Tap to pick</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-[#fffaf0] p-3 text-sm">
        <p className="font-extrabold">Pinned trios</p>
        {matches.length === 0 ? (
          <p className="text-black/70">None yet. The board is lonely.</p>
        ) : (
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {matches.map((m, idx) => {
              const t = byFractionId.get(m.fractionId);
              if (!t) return null;
              return (
                <div key={idx} className="rounded-2xl border border-black/10 bg-white p-3">
                  <p className="font-black">{t.fraction.label} = {t.decimal.label} = {t.percent.label}</p>
                  <p className="text-xs text-black/60">Trio sealed with imaginary tape.</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="lg" disabled={!done} onClick={() => onSubmit({ matches }, matches.length)}>
          ✅ Submit all trios
        </Button>
        {!done ? (
          <p className="text-sm text-black/60">Pin every trio before submitting.</p>
        ) : null}
      </div>
    </div>
  );
}
