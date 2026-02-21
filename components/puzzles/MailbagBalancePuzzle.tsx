"use client";

import * as React from "react";
import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprite } from "@/components/Sprite";

type Parcel = {
  id: string;
  label: string;
  value: number;
  spriteKey: string;
  movable?: boolean;
};

export function MailbagBalancePuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "MAILBAG_BALANCE" }>;
  onSubmit: (answer: { leftIds: string[]; rightIds: string[] }, salt?: number) => void;
}) {
  const [left, setLeft] = React.useState<Parcel[]>(puzzle.params.leftBag);
  const [right, setRight] = React.useState<Parcel[]>(puzzle.params.rightBag);
  const target = puzzle.params.targetWeight;

  const leftTotal = left.reduce((a, p) => a + p.value, 0);
  const rightTotal = right.reduce((a, p) => a + p.value, 0);

  function move(parcelId: string, from: "left" | "right") {
    if (from === "left") {
      const p = left.find((x) => x.id === parcelId);
      if (!p || p.movable === false) return;
      setLeft((xs) => xs.filter((x) => x.id !== parcelId));
      setRight((xs) => [...xs, p]);
    } else {
      const p = right.find((x) => x.id === parcelId);
      if (!p || p.movable === false) return;
      setRight((xs) => xs.filter((x) => x.id !== parcelId));
      setLeft((xs) => [...xs, p]);
    }
  }

  function reset() {
    setLeft(puzzle.params.leftBag);
    setRight(puzzle.params.rightBag);
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Target: {target}</Badge>
          <Badge>Left: {leftTotal}</Badge>
          <Badge>Right: {rightTotal}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={reset}>↩️ Reset</Button>
          <Button onClick={() => onSubmit({ leftIds: left.map((p) => p.id), rightIds: right.map((p) => p.id) }, leftTotal + rightTotal)}>✅ Lock it in</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Bag
          title="Left Bag"
          total={leftTotal}
          target={target}
          parcels={left}
          onMove={(id) => move(id, "left")}
        />
        <Bag
          title="Right Bag"
          total={rightTotal}
          target={target}
          parcels={right}
          onMove={(id) => move(id, "right")}
        />
      </div>

      <div className="rounded-2xl border border-black/10 bg-[#fffaf0] p-3 text-sm text-black/80">
        <p className="font-bold">How to win</p>
        <p>Both bags must total exactly <span className="font-extrabold">{target}</span>. Sealed parcels won’t move (they’re shy).</p>
      </div>
    </div>
  );
}

function Bag({
  title,
  total,
  target,
  parcels,
  onMove,
}: {
  title: string;
  total: number;
  target: number;
  parcels: Parcel[];
  onMove: (id: string) => void;
}) {
  const ok = total === target;
  return (
    <div className={
      "rounded-2xl border p-3 " +
      (ok ? "border-green-700/20 bg-green-500/10" : "border-black/10 bg-white")
    }>
      <div className="flex items-center justify-between">
        <p className="font-extrabold">{title}</p>
        <Badge>{total} / {target}</Badge>
      </div>
      <div className="mt-3 grid gap-2">
        {parcels.map((p) => {
          const locked = p.movable === false;
          return (
            <div key={p.id} className="flex items-center justify-between gap-2 rounded-2xl border border-black/10 bg-white p-2">
              <div className="flex items-center gap-2">
                <Sprite spriteKey={p.spriteKey} label={p.label} />
                <div className="grid">
                  <p className="text-sm font-extrabold">{p.label}</p>
                  <p className="text-xs text-black/60">Value: {p.value}</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={locked}
                onClick={() => onMove(p.id)}
                title={locked ? "Sealed parcels refuse to move." : "Move to other bag"}
              >
                {locked ? "🔒" : "↔️ Move"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
