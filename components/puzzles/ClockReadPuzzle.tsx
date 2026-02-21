"use client";

import * as React from "react";
import { motion } from "framer-motion";

import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ClockReadPuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "CLOCK_READ" }>;
  onSubmit: (answer: { answers: Record<string, string> }, salt?: number) => void;
}) {
  const rounds = puzzle.params.rounds;
  const [idx, setIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [msg, setMsg] = React.useState<string | null>(null);

  const r = rounds[idx];

  function pick(opt: string) {
    setAnswers((m) => ({ ...m, [r.id]: opt }));

    if (opt === r.correctOption) {
      setMsg("Yep! The clock agrees.");
      const next = idx + 1;
      if (next >= rounds.length) {
        const finalAnswers = { ...answers, [r.id]: opt };
        onSubmit({ answers: finalAnswers }, idx);
      } else {
        setTimeout(() => {
          setIdx(next);
          setMsg(null);
        }, 260);
      }
    } else {
      setMsg("Not quite. Check the hour hand too!");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>
            Round {idx + 1} / {rounds.length}
          </Badge>
          <Badge>Pick the matching time</Badge>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setIdx(0);
            setAnswers({});
            setMsg(null);
          }}
        >
          ↩️ Restart
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-[#fffaf0] p-3">
          <p className="text-sm font-extrabold">Clock</p>
          <p className="text-sm text-black/80">{r.prompt}</p>
          <div className="mt-3 flex justify-center">
            <AnalogClock hour={r.hour} minute={r.minute} />
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-3">
          <p className="text-sm font-extrabold">Options</p>
          <div className="mt-3 grid gap-2">
            {r.options.map((opt) => (
              <Button
                key={opt}
                variant="secondary"
                size="lg"
                onClick={() => pick(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
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

      <div className="rounded-2xl border border-black/10 bg-[#e8fbff] p-3 text-sm text-black/80">
        <p className="font-bold">Detective tip</p>
        <p>
          The minute hand tells minutes. The hour hand moves *between* numbers as minutes pass.
        </p>
      </div>
    </div>
  );
}

function AnalogClock({ hour, minute }: { hour: number; minute: number }) {
  const minuteAngle = minute * 6;
  const hourAngle = (hour % 12) * 30 + minute * 0.5;

  return (
    <svg width="220" height="220" viewBox="0 0 220 220" role="img" aria-label={`Clock showing ${hour}:${String(minute).padStart(2, "0")}`}>
      <circle cx="110" cy="110" r="100" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="4" />

      {/* ticks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i * 6 * Math.PI) / 180;
        const inner = i % 5 === 0 ? 82 : 88;
        const outer = 96;
        const x1 = 110 + inner * Math.sin(a);
        const y1 = 110 - inner * Math.cos(a);
        const x2 = 110 + outer * Math.sin(a);
        const y2 = 110 - outer * Math.cos(a);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(0,0,0,0.35)"
            strokeWidth={i % 5 === 0 ? 3 : 1}
          />
        );
      })}

      {/* numbers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const n = i + 1;
        const a = (n * 30 * Math.PI) / 180;
        const r = 70;
        const x = 110 + r * Math.sin(a);
        const y = 110 - r * Math.cos(a);
        return (
          <text
            key={n}
            x={x}
            y={y + 8}
            textAnchor="middle"
            fontSize="16"
            fontWeight="800"
            fill="rgba(0,0,0,0.75)"
          >
            {n}
          </text>
        );
      })}

      {/* hour hand */}
      <g transform={`rotate(${hourAngle} 110 110)`}>
        <line x1="110" y1="110" x2="110" y2="55" stroke="rgba(0,0,0,0.85)" strokeWidth="6" strokeLinecap="round" />
      </g>
      {/* minute hand */}
      <g transform={`rotate(${minuteAngle} 110 110)`}>
        <line x1="110" y1="110" x2="110" y2="35" stroke="rgba(0,0,0,0.85)" strokeWidth="4" strokeLinecap="round" />
      </g>
      <circle cx="110" cy="110" r="6" fill="rgba(0,0,0,0.85)" />
    </svg>
  );
}
