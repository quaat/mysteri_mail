"use client";

import * as React from "react";
import { motion } from "framer-motion";

import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SymmetryOpt = "vertical" | "horizontal" | "diagonal_left" | "diagonal_right" | "none";

export function SymmetryPickPuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "SYMMETRY_PICK" }>;
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

  function choose(opt: SymmetryOpt) {
    if (done) return;
    setAnswers((m) => ({ ...m, [r.id]: opt }));
    const nextIdx = idx + 1;
    if (nextIdx >= rounds.length) {
      onSubmit({ answers: { ...answers, [r.id]: opt } }, idx);
      return;
    }
    setMsg(opt === r.correctOption ? "Mirror magic!" : "That line made it even weirder. Try again next round." );
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
          <Badge>Find the mirror line</Badge>
        </div>
        <Button variant="secondary" onClick={restart}>↩️ Restart</Button>
      </div>

      <div className="rounded-2xl border border-black/10 bg-[#fffaf0] p-3">
        <p className="text-sm font-extrabold">Symmetry Scanner</p>
        <p className="text-sm text-black/80">{r.prompt}</p>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-extrabold">Pick the correct mirror line</p>
        <div className="grid gap-3 md:grid-cols-2">
          {r.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => choose(opt)}
              className="rounded-2xl border border-black/10 bg-white p-3 text-left hover:bg-black/5"
            >
              <div className="flex items-center justify-between">
                <p className="font-extrabold">{optLabel(opt)}</p>
                <span className="text-lg">{optEmoji(opt)}</span>
              </div>
              <div className="mt-2 rounded-2xl border border-black/10 bg-white p-2">
                <SymmetryPreview doodleKey={r.doodleKey} line={opt} />
              </div>
            </button>
          ))}
        </div>
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

      <p className="text-xs text-black/60">Symmetry means the two sides match like a mirror (no smudges, no lies).</p>
    </div>
  );
}

function optLabel(opt: SymmetryOpt) {
  switch (opt) {
    case "vertical":
      return "Vertical";
    case "horizontal":
      return "Horizontal";
    case "diagonal_left":
      return "Diagonal (\\)";
    case "diagonal_right":
      return "Diagonal (/)";
    case "none":
      return "No symmetry";
  }
}

function optEmoji(opt: SymmetryOpt) {
  switch (opt) {
    case "vertical":
      return "🪞";
    case "horizontal":
      return "🧊";
    case "diagonal_left":
      return "🧵";
    case "diagonal_right":
      return "🪡";
    case "none":
      return "🚫";
  }
}

function SymmetryPreview({ doodleKey, line }: { doodleKey: string; line: SymmetryOpt }) {
  return (
    <svg viewBox="0 0 200 120" className="w-full" aria-label={`Symmetry preview ${doodleKey} ${line}`}>
      <rect x="0" y="0" width="200" height="120" rx="18" fill="rgba(0,0,0,0.03)" />
      <Doodle doodleKey={doodleKey} />
      <LineOverlay line={line} />
    </svg>
  );
}

function LineOverlay({ line }: { line: SymmetryOpt }) {
  const common = { stroke: "black", strokeWidth: 4, opacity: 0.45, strokeDasharray: "6 6" } as const;
  if (line === "none") {
    return (
      <g>
        <circle cx="170" cy="24" r="14" fill="rgba(0,0,0,0.06)" />
        <text x="170" y="29" textAnchor="middle" fontSize="16" fontWeight="800" fill="rgba(0,0,0,0.7)">
          🚫
        </text>
      </g>
    );
  }

  if (line === "vertical") return <line x1="100" y1="10" x2="100" y2="110" {...common} />;
  if (line === "horizontal") return <line x1="20" y1="60" x2="180" y2="60" {...common} />;
  if (line === "diagonal_right") return <line x1="30" y1="100" x2="170" y2="20" {...common} />;
  return <line x1="30" y1="20" x2="170" y2="100" {...common} />;
}

function Doodle({ doodleKey }: { doodleKey: string }) {
  // Three intentionally simple doodles; content can add more keys later.
  switch (doodleKey) {
    case "butterfly":
      return (
        <g transform="translate(100,60)">
          <ellipse cx="-45" cy="0" rx="42" ry="28" fill="rgba(0,0,0,0.10)" />
          <ellipse cx="45" cy="0" rx="42" ry="28" fill="rgba(0,0,0,0.10)" />
          <rect x="-7" y="-30" width="14" height="60" rx="7" fill="rgba(0,0,0,0.18)" />
          <circle cx="0" cy="-34" r="10" fill="rgba(0,0,0,0.18)" />
          <circle cx="-3" cy="-36" r="2" fill="black" />
          <circle cx="3" cy="-36" r="2" fill="black" />
          <path d="M -4 -30 Q 0 -26 4 -30" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "kite":
      return (
        <g>
          <polygon points="100,18 150,60 100,102 50,60" fill="rgba(0,0,0,0.12)" />
          <circle cx="100" cy="60" r="4" fill="black" opacity="0.6" />
          <path d="M 100 102 Q 110 110 120 112" stroke="black" strokeWidth="2" fill="none" opacity="0.35" />
          <path d="M 100 102 Q 90 110 80 112" stroke="black" strokeWidth="2" fill="none" opacity="0.35" />
        </g>
      );
    case "staircase":
    default:
      return (
        <g>
          <path
            d="M 50 95 L 50 75 L 70 75 L 70 60 L 92 60 L 92 45 L 115 45 L 115 30 L 150 30"
            stroke="black"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
          <circle cx="55" cy="30" r="10" fill="rgba(0,0,0,0.10)" />
          <text x="55" y="35" textAnchor="middle" fontSize="14" fontWeight="900" fill="rgba(0,0,0,0.7)">
            ?
          </text>
        </g>
      );
  }
}
