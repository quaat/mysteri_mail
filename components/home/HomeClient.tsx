"use client";

import Link from "next/link";
import * as React from "react";

import type { CaseContent } from "@/lib/schema/caseSchema";
import { useProgressStore } from "@/store/progress";
import { useSettingsStore } from "@/store/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HomeClient({ cases }: { cases: CaseContent[] }) {
  const { completedCases, rewards, resetAll } = useProgressStore();
  const settings = useSettingsStore();

  const sorted = React.useMemo(
    () => cases.slice().sort((a, b) => a.orderIndex - b.orderIndex),
    [cases]
  );

  const prereqByCaseId = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const c of sorted) {
      for (const next of c.unlockNextCaseIds) map.set(next, c.caseId);
    }
    return map;
  }, [sorted]);

  const firstUnlocked = sorted.find((c) => {
    const prereq = prereqByCaseId.get(c.caseId);
    return !prereq || !!completedCases[prereq];
  });

  return (
    <div className="grid gap-6 md:gap-8">
      <section className="grid gap-4">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          Open your mail. Solve the math. Catch the goofball.
        </h1>
        <p className="max-w-2xl text-black/70">
          Short mystery episodes with mini-game puzzles. Built for touch and keyboard.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {firstUnlocked ? (
            <Button asChild size="lg">
              <Link href={`/case/${firstUnlocked.caseId}`}>📨 Open Mail</Link>
            </Button>
          ) : (
            <Button size="lg" disabled>
              No cases available
            </Button>
          )}

          <Badge>XP: {rewards.xp}</Badge>
          <Badge>
            Stickers: {Object.keys(rewards.stickers).filter((k) => rewards.stickers[k]).length}
          </Badge>
          <Badge>
            Badges: {Object.keys(rewards.badges).filter((k) => rewards.badges[k]).length}
          </Badge>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-extrabold">Case Files</h2>
        {sorted.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Uh-oh. The mailbox is empty.</CardTitle>
              <CardDescription>
                It looks like the case content didn’t load. Check `content/cases/`.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sorted.map((c) => {
              const done = !!completedCases[c.caseId];
              const prereq = prereqByCaseId.get(c.caseId);
              const locked = prereq ? !completedCases[prereq] : false;

              return (
                <Card key={c.caseId} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{c.title}</CardTitle>
                        <CardDescription>{c.summary}</CardDescription>
                      </div>
                      {locked ? <Badge>🔒 Locked</Badge> : done ? <Badge>✅ Solved</Badge> : <Badge>🕵️ New</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3">
                    <div className="text-sm text-black/70">
                      ~{c.estimatedMinutes} min · Grade {c.difficultyBand}
                    </div>
                    {locked ? (
                      <Button variant="secondary" disabled>
                        Finish previous
                      </Button>
                    ) : (
                      <Button asChild variant={done ? "secondary" : "default"}>
                        <Link href={`/case/${c.caseId}`}>{done ? "Replay" : "Investigate"}</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-extrabold">Settings</h2>
        <Card>
          <CardContent className="grid gap-3 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={settings.toggleSound}>
                {settings.soundOn ? "🔊 Sound: On" : "🔇 Sound: Off"}
              </Button>
              <Button variant="secondary" onClick={settings.toggleReducedMotion}>
                {settings.reducedMotion ? "🧘 Motion: Reduced" : "💃 Motion: Full"}
              </Button>
              <Button variant="secondary" onClick={settings.toggleDyslexiaFont}>
                {settings.dyslexiaFont ? "📖 Font: Easy" : "✍️ Font: Default"}
              </Button>
              <Button variant="secondary" onClick={settings.toggleHighContrast}>
                {settings.highContrast ? "🌓 Contrast: High" : "🌤️ Contrast: Normal"}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-black/70">Reset clears local progress only.</p>
              <Button variant="danger" onClick={resetAll}>
                🧨 Reset Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
