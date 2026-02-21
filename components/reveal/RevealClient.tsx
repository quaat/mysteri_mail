"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { CaseContent } from "@/lib/schema/caseSchema";
import { useProgressStore } from "@/store/progress";
import { popConfetti } from "@/lib/confetti";
import { sfx } from "@/lib/sfx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprite } from "@/components/Sprite";

export function RevealClient({ c }: { c: CaseContent }) {
  const router = useRouter();
  const solvedByCase = useProgressStore((s) => s.solvedByCase[c.caseId] ?? {});
  const completed = useProgressStore((s) => !!s.completedCases[c.caseId]);
  const markCaseCompleted = useProgressStore((s) => s.markCaseCompleted);

  const allSolved = c.puzzles.every((p) => !!solvedByCase[p.id]);

  const [choice, setChoice] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<"idle" | "correct" | "incorrect">("idle");

  if (!allSolved) {
    return (
      <div className="grid gap-4">
        <h1 className="text-2xl font-black">Hold your magnifying glass!</h1>
        <p className="text-black/70">You still have clues to solve before making an accusation.</p>
        <Button asChild>
          <Link href={`/case/${c.caseId}`}>Back to board</Link>
        </Button>
      </div>
    );
  }

  const q = c.finalQuestion;

  function accuse() {
    if (!choice) return;
    const ok = choice === q.correctSuspectId;
    setResult(ok ? "correct" : "incorrect");

    if (ok) {
      sfx.success();
      popConfetti();

      // Award once.
      if (!completed) {
        markCaseCompleted(c.caseId, {
          xp: c.rewards.xp,
          stickers: c.rewards.stickers.map((s) => s.id),
          badges: c.rewards.badges.map((b) => b.id),
        });
      }
    } else {
      sfx.fail();
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Final Accusation</h1>
          <p className="text-black/70 max-w-2xl">{q.question}</p>
          {completed ? <Badge>✅ Case already completed</Badge> : <Badge>🎭 One shot (but you can retry)</Badge>}
        </div>
        <Button variant="secondary" onClick={() => router.push(`/case/${c.caseId}`)}>
          ← Back to board
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pick a suspect</CardTitle>
          <CardDescription>Choose carefully. The ferret is watching.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {q.options.map((sid) => {
            const s = c.suspects.find((x) => x.id === sid);
            if (!s) return null;
            const selected = choice === sid;
            return (
              <button
                key={sid}
                type="button"
                onClick={() => setChoice(sid)}
                className={
                  "rounded-2xl border p-3 text-left transition " +
                  (selected
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white hover:bg-black/5")
                }
              >
                <div className="flex items-start gap-3">
                  <Sprite spriteKey={s.portraitKey} label={s.name} className={selected ? "bg-white/10 border-white/20" : ""} />
                  <div className="grid gap-1">
                    <p className={"font-extrabold " + (selected ? "text-white" : "")}>{s.name}</p>
                    <p className={"text-xs " + (selected ? "text-white/80" : "text-black/60")}>{s.roleTagline}</p>
                    <p className={"text-sm " + (selected ? "text-white/80" : "text-black/70")}>
                      “{s.quips[0]}”
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" disabled={!choice} onClick={accuse}>
          🧷 ACCUSE!
        </Button>
        <Button variant="secondary" onClick={() => { setChoice(null); setResult("idle"); }}>
          🧼 Reset choice
        </Button>
      </div>

      {result !== "idle" ? (
        <Card className={result === "correct" ? "border-green-700/20 bg-green-500/10" : ""}>
          <CardHeader>
            <CardTitle>
              {result === "correct" ? c.reveal.correct.headline : c.reveal.incorrect.headline}
            </CardTitle>
            <CardDescription>
              {result === "correct" ? "You solved it." : "Try again. The math is the real villain."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {(result === "correct" ? c.reveal.correct.bodyParagraphs : c.reveal.incorrect.bodyParagraphs).map(
              (p, i) => (
                <p key={i} className="text-sm text-black/80">
                  {p}
                </p>
              )
            )}

            {result === "correct" ? (
              <div className="mt-2 grid gap-2">
                <p className="text-sm font-extrabold">Rewards</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>XP +{c.rewards.xp}</Badge>
                  {c.rewards.stickers.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2">
                      <Sprite spriteKey={s.spriteKey} label={s.name} />
                      <div className="grid">
                        <p className="text-sm font-extrabold">{s.name}</p>
                        <p className="text-xs text-black/60">Rarity: {s.rarity}</p>
                      </div>
                    </div>
                  ))}
                  {c.rewards.badges.map((b) => (
                    <div key={b.id} className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2">
                      <Sprite spriteKey={b.iconKey} label={b.name} />
                      <div className="grid">
                        <p className="text-sm font-extrabold">{b.name}</p>
                        <p className="text-xs text-black/60">{b.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button asChild>
                    <Link href="/">🏠 Back to mailbox</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={`/case/${c.caseId}`}>🔁 Replay case</Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Why this is the answer</CardTitle>
          <CardDescription>Evidence-based accusations only. The ferret insists.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {c.finalQuestion.correctRationale.map((line, i) => (
            <p key={i} className="text-sm text-black/80">• {line}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
