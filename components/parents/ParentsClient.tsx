"use client";

import * as React from "react";
import Link from "next/link";

import { useProgressStore } from "@/store/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ParentsClient() {
  const { topicStats, rewards, completedCases } = useProgressStore();

  const topics = [
    { key: "add_sub", label: "Addition / Subtraction" },
    { key: "mul_div", label: "Multiplication / Division" },
    { key: "money", label: "Money" },
    { key: "time", label: "Analog Time" },
    { key: "fractions", label: "Fractions" },
    { key: "decimals", label: "Decimals" },
    { key: "percent", label: "Percent" },
    { key: "mixed", label: "Mixed Review" },
  ] as const;

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Parents / Teacher</h1>
        <p className="text-black/70 max-w-2xl">
          This is a simple local dashboard. No accounts, no tracking. Everything stays in your browser.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>XP: {rewards.xp}</Badge>
          <Badge>
            Cases completed: {Object.keys(completedCases).filter((k) => completedCases[k]).length}
          </Badge>
        </div>
        <Button asChild variant="secondary" className="w-fit">
          <Link href="/">← Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Topic practice</CardTitle>
          <CardDescription>Accuracy is calculated from attempts in this browser.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {topics.map((t) => {
            const s = topicStats[t.key];
            const acc = s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0;
            return (
              <div key={t.key} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white p-3">
                <div className="grid">
                  <p className="font-extrabold">{t.label}</p>
                  <p className="text-sm text-black/70">
                    Attempts: {s.attempts} · Correct: {s.correct} · Streak: {s.streak}
                  </p>
                </div>
                <Badge>Accuracy: {acc}%</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teaching notes</CardTitle>
          <CardDescription>How this app scaffolds skills.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-black/80">
          <p>• Early cases focus on number sense and flexible strategies, not just speed.</p>
          <p>• Hints are tiered: suggestion → highlighting → partial step.</p>
          <p>• Puzzles are multi-modal (tap, drag, select) to keep attention without being a worksheet.</p>
          <p>• Sound and motion can be reduced in settings for sensitive learners.</p>
        </CardContent>
      </Card>
    </div>
  );
}
