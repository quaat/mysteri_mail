"use client";

import * as React from "react";

import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AreaRectBuilderPuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "AREA_RECT_BUILDER" }>;
  onSubmit: (answer: { rows: number; cols: number }, salt?: number) => void;
}) {
  const p = puzzle.params;
  const [rows, setRows] = React.useState(p.rowsMin);
  const [cols, setCols] = React.useState(p.colsMin);

  const area = rows * cols;
  const perimeter = 2 * (rows + cols);

  function clampRows(n: number) {
    return Math.max(p.rowsMin, Math.min(p.rowsMax, n));
  }
  function clampCols(n: number) {
    return Math.max(p.colsMin, Math.min(p.colsMax, n));
  }

  function submit() {
    onSubmit({ rows, cols }, area * 100 + perimeter);
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Target area: {p.targetArea} {p.unitLabel}</Badge>
          {typeof p.requiredPerimeter === "number" ? <Badge>Required perimeter: {p.requiredPerimeter}</Badge> : null}
        </div>
        <Button variant="secondary" onClick={() => { setRows(p.rowsMin); setCols(p.colsMin); }}>
          ↩️ Reset
        </Button>
      </div>

      <div className="rounded-2xl border border-black/10 bg-[#fffaf0] p-3 text-sm text-black/80">
        <p className="font-extrabold">Blueprint Builder</p>
        <p>
          Choose <span className="font-extrabold">rows</span> and <span className="font-extrabold">columns</span> to build a rectangle.
          Your rectangle must match the target <span className="font-extrabold">area</span>
          {typeof p.requiredPerimeter === "number" ? " and the required perimeter" : ""}.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-3">
          <Stepper
            label="Rows"
            value={rows}
            onDec={() => setRows((v) => clampRows(v - 1))}
            onInc={() => setRows((v) => clampRows(v + 1))}
            min={p.rowsMin}
            max={p.rowsMax}
          />
          <Stepper
            label="Columns"
            value={cols}
            onDec={() => setCols((v) => clampCols(v - 1))}
            onInc={() => setCols((v) => clampCols(v + 1))}
            min={p.colsMin}
            max={p.colsMax}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Badge>Area = {rows} × {cols} = {area}</Badge>
            <Badge>Perimeter = 2 × ({rows}+{cols}) = {perimeter}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => { const r = rows; setRows(cols); setCols(r); }}>
              🔁 Swap
            </Button>
            <Button onClick={submit} size="lg">Approve Blueprint</Button>
          </div>

          <p className="text-xs text-black/60">
            Hint: more than one rectangle can have the same area — but the perimeter rule (if present) makes it extra spicy.
          </p>
        </div>

        <div className="grid gap-2">
          <p className="text-sm font-extrabold">Preview</p>
          <div className="rounded-2xl border border-black/10 bg-white p-3">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              }}
              aria-label="Rectangle preview grid"
            >
              {Array.from({ length: rows * cols }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg border border-black/10 bg-black/5"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({
  label,
  value,
  onDec,
  onInc,
  min,
  max,
}: {
  label: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white p-3">
      <div className="grid">
        <p className="text-sm font-extrabold">{label}</p>
        <p className="text-xs text-black/60">Range: {min}–{max}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onDec} disabled={value <= min} aria-label={`${label} decrease`}>
          −
        </Button>
        <span className="min-w-10 text-center text-lg font-black tabular-nums">{value}</span>
        <Button variant="secondary" onClick={onInc} disabled={value >= max} aria-label={`${label} increase`}>
          +
        </Button>
      </div>
    </div>
  );
}
