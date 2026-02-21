"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TopicKey } from "@/lib/schema/types";

export type TopicStats = {
  attempts: number;
  correct: number;
  streak: number;
  lastSeenISO?: string;
};

export type ProgressState = {
  solvedByCase: Record<string, Record<string, boolean>>; // caseId -> puzzleId -> solved
  completedCases: Record<string, boolean>;
  rewards: {
    stickers: Record<string, boolean>;
    badges: Record<string, boolean>;
    xp: number;
  };
  topicStats: Record<TopicKey, TopicStats>;

  markPuzzleAttempt(topic: TopicKey, correct: boolean): void;
  markPuzzleSolved(caseId: string, puzzleId: string): void;
  markCaseCompleted(caseId: string, reward: { xp: number; stickers: string[]; badges: string[] }): void;
  resetAll(): void;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyTopicStats = (): Record<TopicKey, TopicStats> => ({
  add_sub: { attempts: 0, correct: 0, streak: 0 },
  mul_div: { attempts: 0, correct: 0, streak: 0 },
  money: { attempts: 0, correct: 0, streak: 0 },
  time: { attempts: 0, correct: 0, streak: 0 },
  mixed: { attempts: 0, correct: 0, streak: 0 },
});

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      solvedByCase: {},
      completedCases: {},
      rewards: { stickers: {}, badges: {}, xp: 0 },
      topicStats: emptyTopicStats(),

      markPuzzleAttempt: (topic, isCorrect) => {
        const stats = get().topicStats[topic] ?? { attempts: 0, correct: 0, streak: 0 };
        set((s) => ({
          topicStats: {
            ...s.topicStats,
            [topic]: {
              attempts: stats.attempts + 1,
              correct: stats.correct + (isCorrect ? 1 : 0),
              streak: isCorrect ? stats.streak + 1 : 0,
              lastSeenISO: todayISO(),
            },
          },
        }));
      },

      markPuzzleSolved: (caseId, puzzleId) => {
        set((s) => ({
          solvedByCase: {
            ...s.solvedByCase,
            [caseId]: { ...s.solvedByCase[caseId], [puzzleId]: true },
          },
        }));
      },

      markCaseCompleted: (caseId, reward) => {
        set((s) => {
          const nextStickers = { ...s.rewards.stickers };
          for (const st of reward.stickers) nextStickers[st] = true;

          const nextBadges = { ...s.rewards.badges };
          for (const b of reward.badges) nextBadges[b] = true;

          return {
            completedCases: { ...s.completedCases, [caseId]: true },
            rewards: {
              xp: s.rewards.xp + reward.xp,
              stickers: nextStickers,
              badges: nextBadges,
            },
          };
        });
      },

      resetAll: () => set({ solvedByCase: {}, completedCases: {}, rewards: { stickers: {}, badges: {}, xp: 0 }, topicStats: emptyTopicStats() }),
    }),
    {
      name: "mm_progress_v1",
      version: 1,
    }
  )
);
