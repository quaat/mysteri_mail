"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { PuzzleContent } from "@/lib/schema/caseSchema";
import { Badge } from "@/components/ui/badge";
import { Sprite } from "@/components/Sprite";

export function BubblePopDifferencePuzzle({
  puzzle,
  onSubmit,
}: {
  puzzle: Extract<PuzzleContent, { type: "BUBBLE_POP_DIFFERENCE" }>;
  onSubmit: (answer: string, salt?: number) => void;
}) {
  const [poppedId, setPoppedId] = React.useState<string | null>(null);

  const goal = puzzle.params.goalValue;
  const req = puzzle.params.required ?? {};

  function pop(id: string) {
    setPoppedId(id);
    // Delay to let the bubble animate before validation feedback appears above
    setTimeout(() => onSubmit(id, id.length), 180);
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Goal: {goal}</Badge>
        {req.op ? <Badge>Op: {req.op === "sub" ? "−" : "+"}</Badge> : null}
        {Array.isArray(req.mustUseNumbers) ? (
          <Badge>Must use: {req.mustUseNumbers.join(" & ")}</Badge>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {puzzle.params.bubbles.map((b) => {
          const { a, b: bb, op } = b.expression;
          const expr = `${a} ${op === "add" ? "+" : "−"} ${bb}`;
          const isPopped = poppedId === b.id;

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => pop(b.id)}
              className="text-left"
              aria-label={`Pop bubble: ${b.statement}`}
            >
              <div className="rounded-[28px] border border-black/10 bg-[#e8fbff] p-3 shadow-soft hover:bg-[#dff7ff]">
                <div className="flex items-start gap-3">
                  <Sprite spriteKey={b.spriteKey} label={b.id} />
                  <div className="grid gap-1">
                    <p className="text-sm font-extrabold">Witness Bubble</p>
                    <p className="text-sm text-black/80">{b.statement}</p>
                    <p className="text-xs text-black/60">Math code: {expr}</p>
                    <p className="text-xs text-black/50">Vibe: {b.tag}</p>
                  </div>
                </div>

                <AnimatePresence>
                  {isPopped ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 rounded-2xl border border-black/10 bg-white p-2 text-center text-sm font-extrabold"
                    >
                      💥 POP!
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-black/10 bg-[#fffaf0] p-3 text-sm text-black/80">
        <p className="font-bold">Detective tip</p>
        <p>
          You’re looking for the bubble that matches the goal AND the required numbers/operation.
        </p>
      </div>
    </div>
  );
}
