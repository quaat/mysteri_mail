"use client";

import * as React from "react";
import { motion } from "framer-motion";

import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprite } from "@/components/Sprite";

export function NumberInputQuizPuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "NUMBER_INPUT_QUIZ" }>;
  onSubmit: (answer: { answers: Record<string, number> }, salt?: number) => void;
}) {
  const rounds = puzzle.params.rounds;
  const maxMistakes = puzzle.params.maxMistakes;

  const [idx, setIdx] = React.useState(0);
  const [value, setValue] = React.useState<string>("");
  const [mistakes, setMistakes] = React.useState(0);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});

  const r = rounds[idx];
  const done = idx >= rounds.length;

  function appendDigit(d: string) {
    setValue((v) => (v === "0" ? d : v + d));
  }

  function backspace() {
    setValue((v) => v.slice(0, -1));
  }

  function clear() {
    setValue("");
  }

  function submitRound() {
    const n = Number(value);
    if (!Number.isFinite(n)) {
      setMsg("Type a number, detective.");
      return;
    }

    if (n === r.answer) {
      setAnswers((m) => ({ ...m, [r.id]: n }));
      setMsg(r.solvedQuip ?? "Nice." );
      setValue("");

      const nextIdx = idx + 1;
      if (nextIdx >= rounds.length) {
        // Finished!
        const finalAnswers = { ...answers, [r.id]: n };
        onSubmit({ answers: finalAnswers }, mistakes);
      } else {
        setTimeout(() => {
          setIdx(nextIdx);
          setMsg(null);
        }, 300);
      }
    } else {
      setMistakes((m) => m + 1);
      setMsg("Nope — the math gremlins are giggling. Try again.");
    }
  }

  // Keyboard support
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (done) return;
      if (e.key >= "0" && e.key <= "9") appendDigit(e.key);
      if (e.key === "Backspace") backspace();
      if (e.key === "Enter") submitRound();
      if (e.key === "Escape") clear();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, value, idx, answers]);

  if (done) return null;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>
            Round {idx + 1} / {rounds.length}
          </Badge>
          <Badge>Mistakes: {mistakes}{typeof maxMistakes === "number" ? ` (suggested max ${maxMistakes})` : ""}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => { setIdx(0); setValue(""); setMistakes(0); setMsg(null); setAnswers({}); }}>
            ↩️ Restart
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-[#fffaf0] p-3">
        <div className="flex items-start gap-3">
          {r.spriteKey ? <Sprite spriteKey={r.spriteKey} label={r.id} /> : <span className="text-3xl">🧠</span>}
          <div className="grid gap-1">
            <p className="text-sm font-extrabold">Question</p>
            <p className="text-sm text-black/80">{r.question}</p>
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

      <div className="grid gap-2">
        <p className="text-sm font-extrabold">Your answer</p>
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^0-9-]/g, ""))}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-lg font-black outline-none"
            inputMode="numeric"
            placeholder="Type here or use keypad"
          />
          <Button onClick={submitRound} size="lg">OK</Button>
        </div>
      </div>

      <Keypad
        onDigit={appendDigit}
        onBack={backspace}
        onClear={clear}
      />

      <p className="text-xs text-black/60">Keyboard: 0–9, Enter = OK, Backspace = delete, Esc = clear.</p>
    </div>
  );
}

function Keypad({
  onDigit,
  onBack,
  onClear,
}: {
  onDigit: (d: string) => void;
  onBack: () => void;
  onClear: () => void;
}) {
  const digits = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"];

  return (
    <div className="grid gap-2">
      <p className="text-sm font-extrabold">Keypad</p>
      <div className="grid grid-cols-3 gap-2">
        {digits.slice(0, 9).map((d) => (
          <Button key={d} variant="secondary" size="lg" onClick={() => onDigit(d)}>
            {d}
          </Button>
        ))}
        <Button variant="secondary" size="lg" onClick={onBack}>
          ⌫
        </Button>
        <Button variant="secondary" size="lg" onClick={() => onDigit("0")}>
          0
        </Button>
        <Button variant="secondary" size="lg" onClick={onClear}>
          C
        </Button>
      </div>
    </div>
  );
}
