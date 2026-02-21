"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import type { CaseContent, PuzzleContent } from "@/lib/schema/caseSchema";
import { validatePuzzle, pickQuip } from "@/lib/puzzle/validate";
import { useProgressStore } from "@/store/progress";
import { popConfetti } from "@/lib/confetti";
import { sfx } from "@/lib/sfx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { StampSumPuzzle } from "@/components/puzzles/StampSumPuzzle";
import { MailbagBalancePuzzle } from "@/components/puzzles/MailbagBalancePuzzle";
import { BubblePopDifferencePuzzle } from "@/components/puzzles/BubblePopDifferencePuzzle";
import { EvidenceTapePathPuzzle } from "@/components/puzzles/EvidenceTapePathPuzzle";
import { NumberInputQuizPuzzle } from "@/components/puzzles/NumberInputQuizPuzzle";
import { CoinSumPuzzle } from "@/components/puzzles/CoinSumPuzzle";
import { ClockReadPuzzle } from "@/components/puzzles/ClockReadPuzzle";
import { FractionPieSumPuzzle } from "@/components/puzzles/FractionPieSumPuzzle";
import { DecimalNumberLinePuzzle } from "@/components/puzzles/DecimalNumberLinePuzzle";
import { PercentSprinklePuzzle } from "@/components/puzzles/PercentSprinklePuzzle";
import { FdpTrioMatchPuzzle } from "@/components/puzzles/FdpTrioMatchPuzzle";

export function PuzzleClient({ c, p }: { c: CaseContent; p: PuzzleContent }) {
  const router = useRouter();
  const markSolved = useProgressStore((s) => s.markPuzzleSolved);
  const markAttempt = useProgressStore((s) => s.markPuzzleAttempt);
  const solved = useProgressStore((s) => !!(s.solvedByCase[c.caseId]?.[p.id]));

  const [hintLevel, setHintLevel] = React.useState(0);
  const [feedback, setFeedback] = React.useState<{ kind: "ok" | "no"; text: string } | null>(null);
  const [wobble, setWobble] = React.useState(false);

  const hintText = p.hints?.[Math.min(hintLevel, (p.hints?.length ?? 1) - 1)] ?? "No hints for this one.";

  function onSubmit(answer: unknown, salt = 0) {
    const res = validatePuzzle(p, answer);
    markAttempt(p.topicKey, res.correct);

    if (res.correct) {
      sfx.success();
      popConfetti();
      const quip = pickQuip(p.ui.successQuips, p.seed + salt);
      setFeedback({ kind: "ok", text: quip || res.message });
      markSolved(c.caseId, p.id);
      setTimeout(() => router.push(`/case/${c.caseId}`), 700);
    } else {
      sfx.fail();
      const quip = pickQuip(p.ui.failQuips, p.seed + salt);
      setFeedback({ kind: "no", text: quip || res.message });
      setWobble(true);
      setTimeout(() => setWobble(false), 400);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{p.title}</h1>
          <p className="text-black/70 max-w-2xl">{p.prompt}</p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge>{p.topicKey.replace("_", "/")}</Badge>
            <Badge>Difficulty: {p.difficulty}/5</Badge>
            {solved ? <Badge>✅ Solved</Badge> : <Badge>🧩 New</Badge>}
          </div>
        </div>
        <Button asChild variant="secondary">
          <Link href={`/case/${c.caseId}`}>← Back to board</Link>
        </Button>
      </div>

      <Card className={wobble ? "mm-wobble" : ""}>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <CardTitle>Clue Mini-Game</CardTitle>
              <CardDescription>{p.ui.introLine ?? "Solve the clue to unlock evidence."}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setHintLevel((h) => h + 1)}>
                💡 Hint
              </Button>
              <Button variant="secondary" onClick={() => setHintLevel(0)}>
                🧼 Clear hints
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {hintLevel > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-black/10 bg-[#fffaf0] p-3 text-sm"
            >
              <p className="font-bold">Hint {hintLevel}</p>
              <p className="text-black/80">{hintText}</p>
            </motion.div>
          ) : null}

          {feedback ? (
            <div
              className={
                "rounded-2xl border p-3 text-sm font-semibold " +
                (feedback.kind === "ok"
                  ? "border-green-700/20 bg-green-500/10"
                  : "border-black/10 bg-black/5")
              }
              role="status"
            >
              {feedback.text}
            </div>
          ) : null}

          <div className="rounded-2xl border border-black/10 bg-white p-3 md:p-4">
            {p.type === "STAMP_SUM" ? (
              <StampSumPuzzle puzzle={p} onSubmit={onSubmit} />
            ) : p.type === "MAILBAG_BALANCE" ? (
              <MailbagBalancePuzzle puzzle={p} onSubmit={onSubmit} />
            ) : p.type === "BUBBLE_POP_DIFFERENCE" ? (
              <BubblePopDifferencePuzzle puzzle={p} onSubmit={onSubmit} />
            ) : p.type === "EVIDENCE_TAPE_PATH" ? (
              <EvidenceTapePathPuzzle puzzle={p} onSubmit={onSubmit} />
            ) : p.type === "NUMBER_INPUT_QUIZ" ? (
              <NumberInputQuizPuzzle puzzle={p} onSubmit={onSubmit} />
            ) : p.type === "COIN_SUM" ? (
              <CoinSumPuzzle puzzle={p} onSubmit={onSubmit} />
            ) : p.type === "CLOCK_READ" ? (
              <ClockReadPuzzle puzzle={p} onSubmit={onSubmit} />
            ) : p.type === "FRACTION_PIE_SUM" ? (
              <FractionPieSumPuzzle puzzle={p} onSubmit={onSubmit} />
            ) : p.type === "DECIMAL_NUMBER_LINE" ? (
              <DecimalNumberLinePuzzle puzzle={p} onSubmit={onSubmit} />
            ) : p.type === "PERCENT_SPRINKLE" ? (
              <PercentSprinklePuzzle puzzle={p} onSubmit={onSubmit} />
            ) : p.type === "FDP_TRIO_MATCH" ? (
              <FdpTrioMatchPuzzle puzzle={p} onSubmit={onSubmit} />
            ) : (
              <p>Not implemented yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
