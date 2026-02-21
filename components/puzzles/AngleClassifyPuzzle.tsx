"use client";

import * as React from "react";
import { motion } from "framer-motion";

import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AngleLabel = "acute" | "right" | "obtuse";

export function AngleClassifyPuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "ANGLE_CLASSIFY" }>;
  onSubmit: (answer: { answers: Record<string, string> }, salt?: number) => void;
}) {
  const rounds = puzzle.params.rounds;
  const [idx, setIdx] = React.useState(0);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});

  const r = rounds[idx];
  const done = idx >= rounds.length;

  function restart() {
    setIdx(0);
    setMsg(null);
    setAnswers({});
  }

  function choose(opt: AngleLabel) {
    if (done) return;
    setAnswers((m) => ({ ...m, [r.id]: opt }));

    const nextIdx = idx + 1;
    if (nextIdx >= rounds.length) {
      onSubmit({ answers: { ...answers, [r.id]: opt } }, idx);
      return;
    }
    setMsg(opt === r.correctOption ? "Nice!" : "Bold choice. Suspiciously bold." );
    setTimeout(() => {
      setIdx(nextIdx);
      setMsg(null);
    }, 250);
  }

  if (done) return null;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Round {idx + 1} / {rounds.length}</Badge>
          {puzzle.params.showDegrees ? <Badge>{r.degrees}°</Badge> : null}
        </div>
        <Button variant="secondary" onClick={restart}>↩️ Restart</Button>
      </div>

      <div className="rounded-2xl border border-black/10 bg-[#fffaf0] p-3">
        <p className="text-sm font-extrabold">Angle Inspector</p>
        <p className="text-sm text-black/80">{r.prompt}</p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-3">
        <AngleDiagram degrees={r.degrees} showDegrees={puzzle.params.showDegrees} />
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
        <p className="text-sm font-extrabold">Pick the angle type</p>
        <div className="flex flex-wrap gap-2">
          {r.options.map((opt) => (
            <Button key={opt} variant="secondary" size="lg" onClick={() => choose(opt)}>
              {labelEmoji(opt)} {labelText(opt)}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-xs text-black/60">Acute &lt; 90° · Right = 90° · Obtuse &gt; 90°.</p>
    </div>
  );
}

function labelEmoji(opt: AngleLabel) {
  if (opt === "acute") return "🦔";
  if (opt === "right") return "🧱";
  return "🦒";
}

function labelText(opt: AngleLabel) {
  if (opt === "acute") return "Acute";
  if (opt === "right") return "Right";
  return "Obtuse";
}

function AngleDiagram({ degrees, showDegrees }: { degrees: number; showDegrees: boolean }) {
  // Keep it simple: ray 1 is horizontal, ray 2 rotates up.
  const r = 80;
  const cx = 100;
  const cy = 110;

  const rad = (Math.PI / 180) * degrees;
  const x2 = cx + r * Math.cos(rad);
  const y2 = cy - r * Math.sin(rad);

  // Arc
  const arcR = 36;
  const ax1 = cx + arcR;
  const ay1 = cy;
  const ax2 = cx + arcR * Math.cos(rad);
  const ay2 = cy - arcR * Math.sin(rad);
  const largeArc = degrees > 180 ? 1 : 0;

  return (
    <svg viewBox="0 0 220 160" className="w-full max-w-md mx-auto" aria-label={`Angle diagram ${degrees} degrees`}>
      <rect x="0" y="0" width="220" height="160" rx="18" fill="rgba(0,0,0,0.03)" />

      {/* Rays */}
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="black" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
      <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="black" strokeWidth="6" strokeLinecap="round" opacity="0.85" />

      {/* Vertex */}
      <circle cx={cx} cy={cy} r="6" fill="black" />

      {/* Arc */}
      <path
        d={`M ${ax1} ${ay1} A ${arcR} ${arcR} 0 ${largeArc} 0 ${ax2} ${ay2}`}
        fill="none"
        stroke="black"
        strokeWidth="4"
        opacity="0.35"
      />

      {/* Silly face */}
      <circle cx="42" cy="40" r="14" fill="rgba(0,0,0,0.06)" />
      <circle cx="38" cy="38" r="2" fill="black" />
      <circle cx="46" cy="38" r="2" fill="black" />
      <path d="M 37 45 Q 42 49 47 45" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />

      {showDegrees ? (
        <text x="110" y="30" textAnchor="middle" fontSize="14" fontWeight="700" fill="rgba(0,0,0,0.7)">
          {degrees}°
        </text>
      ) : null}
    </svg>
  );
}
