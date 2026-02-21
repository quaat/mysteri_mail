"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import * as React from "react";

import type { CaseContent } from "@/lib/schema/caseSchema";
import { useProgressStore } from "@/store/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprite } from "@/components/Sprite";

export function CaseClient({ c }: { c: CaseContent }) {
  const solved = useProgressStore((s) => s.solvedByCase[c.caseId] ?? {});
  const completed = useProgressStore((s) => !!s.completedCases[c.caseId]);

  const solvedCount = c.puzzles.filter((p) => solved[p.id]).length;
  const allSolved = solvedCount === c.puzzles.length;

  // Evidence unlocked when its puzzle is solved.
  const unlockedEvidenceIds = new Set(
    c.puzzles.filter((p) => solved[p.id]).map((p) => p.unlocksEvidenceId)
  );

  return (
    <div className="grid gap-6 md:gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{c.title}</h1>
          <p className="text-black/70 max-w-2xl">{c.summary}</p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge>
              Clues: {solvedCount}/{c.puzzles.length}
            </Badge>
            <Badge>~{c.estimatedMinutes} min</Badge>
            {completed ? <Badge>✅ Completed</Badge> : <Badge>🕵️ In progress</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {allSolved ? (
            <Button asChild size="lg">
              <Link href={`/reveal/${c.caseId}`}>🧩 Make Accusation</Link>
            </Button>
          ) : (
            <Button asChild variant="secondary" size="lg">
              <Link href="#clues">🔎 Solve Clues</Link>
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -2, y: 6 }}
              animate={{ rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 14 }}
              className="text-3xl"
            >
              ✉️
            </motion.div>
            <div className="grid">
              <CardTitle>Incoming Letter</CardTitle>
              <CardDescription>
                From: {c.introLetter.fromName} · Postmark: {c.introLetter.postmark.city} ({c.introLetter.postmark.dateISO})
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="rounded-2xl border border-black/10 bg-[#fffaf0] p-4">
            <p className="text-sm font-semibold">Subject: {c.introLetter.subjectLine}</p>
            <div className="mt-3 grid gap-2 text-sm text-black/80">
              {c.introLetter.bodyParagraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
            <pre className="mt-3 whitespace-pre-wrap text-sm text-black/80">
{c.introLetter.signature}
            </pre>
            <p className="mt-3 text-xs text-black/60">{c.introLetter.postmark.stampSlogan}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Suspects</CardTitle>
            <CardDescription>Everyone is innocent until the math says otherwise.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {c.suspects.map((s) => (
              <div key={s.id} className="flex gap-3 rounded-2xl border border-black/10 bg-white p-3">
                <Sprite spriteKey={s.portraitKey} label={s.name} />
                <div className="grid gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-extrabold">{s.name}</p>
                    <Badge>{s.roleTagline}</Badge>
                  </div>
                  <p className="text-sm text-black/70">“{s.alibi.claim}”</p>
                  <p className="text-xs text-black/60">Detective note: {s.alibi.note}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence (Sticker Board)</CardTitle>
            <CardDescription>Solve clues to unlock more deliciously suspicious stickers.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {c.evidence.map((e) => {
              const unlocked = unlockedEvidenceIds.has(e.id);
              return (
                <div
                  key={e.id}
                  className={
                    "flex items-center gap-3 rounded-2xl border border-black/10 p-3 " +
                    (unlocked ? "bg-white" : "bg-black/5")
                  }
                >
                  <Sprite spriteKey={e.spriteKey} label={e.label} className={unlocked ? "" : "opacity-40"} />
                  <div className="grid">
                    <p className={"font-extrabold " + (unlocked ? "" : "text-black/50")}>{e.label}</p>
                    <p className={"text-sm " + (unlocked ? "text-black/70" : "text-black/40")}>
                      {unlocked ? e.description : "Locked. Solve more clues."}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card id="clues">
        <CardHeader>
          <CardTitle>Clues</CardTitle>
          <CardDescription>Pick any clue. Each one unlocks a sticker and a new suspicion.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {c.puzzles.map((p) => {
            const isSolved = !!solved[p.id];
            return (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white p-3">
                <div className="grid">
                  <p className="font-extrabold">
                    {isSolved ? "✅" : "🧩"} {p.title}
                  </p>
                  <p className="text-sm text-black/70">{p.prompt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{p.topicKey.replace("_", "/")}</Badge>
                  <Button asChild variant={isSolved ? "secondary" : "default"}>
                    <Link href={`/case/${c.caseId}/puzzle/${p.id}`}>{isSolved ? "Replay" : "Solve"}</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Locations</CardTitle>
          <CardDescription>Totally normal places where totally normal things happen.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {c.locations.map((l) => (
            <div key={l.id} className="rounded-2xl border border-black/10 bg-white p-3">
              <p className="font-extrabold">{l.name}</p>
              <p className="text-sm text-black/70">{l.description}</p>
              <p className="mt-2 text-xs text-black/50">Background key: {l.backgroundKey}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
