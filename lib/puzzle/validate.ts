import type { PuzzleContent } from "@/lib/schema/caseSchema";

export type ValidationResult = {
  correct: boolean;
  message: string;
  meta?: Record<string, unknown>;
};

function pick<T>(arr: T[], index: number): T {
  return arr[Math.max(0, Math.min(arr.length - 1, index))];
}

export function pickQuip(quipList: string[], salt: number): string {
  if (quipList.length === 0) return "";
  return pick(quipList, Math.abs(salt) % quipList.length);
}

export function validatePuzzle(puzzle: PuzzleContent, answer: unknown): ValidationResult {
  switch (puzzle.type) {
    case "STAMP_SUM": {
      const selectedIds = Array.isArray(answer) ? (answer as string[]) : [];
      const { stamps, targetCents, constraints } = puzzle.params;

      if (selectedIds.length === 0) {
        return { correct: false, message: "Add some stamps to the envelope." };
      }
      if (selectedIds.length > constraints.maxStamps) {
        return { correct: false, message: `Too many stamps! Max is ${constraints.maxStamps}.` };
      }

      const stampById = new Map(stamps.map((s) => [s.id, s] as const));
      let total = 0;
      for (const id of selectedIds) total += stampById.get(id)?.valueCents ?? 0;

      for (const id of selectedIds) {
        const st = stampById.get(id);
        if (st?.requiresStampId && !selectedIds.includes(st.requiresStampId)) {
          const req = stampById.get(st.requiresStampId);
          return {
            correct: false,
            message: `${st.label} demands its friend: ${req?.label ?? st.requiresStampId}.`,
          };
        }
      }

      if (total !== targetCents) {
        const diff = targetCents - total;
        const hint = diff > 0 ? `You need ${diff}¢ more.` : `You have ${Math.abs(diff)}¢ too much.`;
        return { correct: false, message: hint, meta: { total } };
      }

      const fewest = constraints.bonusFewestStamps;
      const bonus = typeof fewest === "number" && selectedIds.length <= fewest;
      return {
        correct: true,
        message: bonus ? "Perfect—and super efficient!" : "Perfect postage!",
        meta: { total, bonus },
      };
    }

    case "MAILBAG_BALANCE": {
      const a = answer as { leftIds?: string[]; rightIds?: string[] };
      const leftIds = Array.isArray(a?.leftIds) ? a.leftIds : [];
      const rightIds = Array.isArray(a?.rightIds) ? a.rightIds : [];

      const all = [...puzzle.params.leftBag, ...puzzle.params.rightBag];
      const byId = new Map(all.map((p) => [p.id, p] as const));
      const sum = (ids: string[]) => ids.reduce((acc, id) => acc + (byId.get(id)?.value ?? 0), 0);

      const leftTotal = sum(leftIds);
      const rightTotal = sum(rightIds);
      const t = puzzle.params.targetWeight;

      if (leftTotal !== t || rightTotal !== t) {
        return {
          correct: false,
          message: `Not yet. Left is ${leftTotal}, right is ${rightTotal}. Both must be ${t}.`,
          meta: { leftTotal, rightTotal },
        };
      }

      return { correct: true, message: "Balanced to perfection!", meta: { leftTotal, rightTotal } };
    }

    case "BUBBLE_POP_DIFFERENCE": {
      const bubbleId = typeof answer === "string" ? answer : "";
      const bubble = puzzle.params.bubbles.find((b) => b.id === bubbleId);
      if (!bubble) return { correct: false, message: "Pick a bubble to pop." };

      const { a: x, b: y, op } = bubble.expression;
      const value = op === "add" ? x + y : x - y;

      const req = puzzle.params.required ?? {};
      if (typeof req.op === "string" && req.op !== op) {
        return { correct: false, message: "Right number maybe… wrong operation!", meta: { value } };
      }
      if (Array.isArray(req.mustUseNumbers) && req.mustUseNumbers.length > 0) {
        const must = new Set(req.mustUseNumbers);
        if (!(must.has(x) && must.has(y))) {
          return { correct: false, message: "That bubble isn’t using the right numbers.", meta: { value } };
        }
      }

      if (value !== puzzle.params.goalValue) {
        return { correct: false, message: `That pops to ${value}, not ${puzzle.params.goalValue}.`, meta: { value } };
      }

      return { correct: true, message: "POP! That was the lie.", meta: { value } };
    }

    case "EVIDENCE_TAPE_PATH": {
      const selectedIds = Array.isArray(answer) ? (answer as string[]) : [];
      const { start, target, pickCount, moveCards, mustUseExactlyPickCount } = puzzle.params;
      const byId = new Map(moveCards.map((c) => [c.id, c] as const));

      if (mustUseExactlyPickCount && selectedIds.length !== pickCount) {
        return { correct: false, message: `Use exactly ${pickCount} cards. You used ${selectedIds.length}.` };
      }
      if (!mustUseExactlyPickCount && selectedIds.length > pickCount) {
        return { correct: false, message: `You can use up to ${pickCount} cards.` };
      }

      let value = start;
      for (const id of selectedIds) value += byId.get(id)?.delta ?? 0;

      if (value !== target) {
        return { correct: false, message: `You landed on ${value}. Target is ${target}.`, meta: { value } };
      }

      return { correct: true, message: "Route verified!", meta: { value } };
    }

    case "NUMBER_INPUT_QUIZ": {
      const a = answer as { answers?: Record<string, number> };
      const answers = a?.answers ?? {};

      let wrong = 0;
      for (const r of puzzle.params.rounds) {
        const got = answers[r.id];
        if (typeof got !== "number" || got !== r.answer) wrong++;
      }

      if (wrong > 0) {
        return {
          correct: false,
          message: `Not quite. ${wrong} round${wrong === 1 ? "" : "s"} off.`,
          meta: { wrong },
        };
      }

      return { correct: true, message: "Math combo complete!", meta: { wrong } };
    }

    case "COIN_SUM": {
      const selectedIds = Array.isArray(answer) ? (answer as string[]) : [];
      const { coins, targetCents, constraints } = puzzle.params;
      if (selectedIds.length === 0) return { correct: false, message: "Add some coins." };
      if (selectedIds.length > constraints.maxCoins) {
        return { correct: false, message: `Too many coins! Max is ${constraints.maxCoins}.` };
      }

      const coinById = new Map(coins.map((c) => [c.id, c] as const));
      const total = selectedIds.reduce((acc, id) => acc + (coinById.get(id)?.valueCents ?? 0), 0);

      if (total !== targetCents) {
        const diff = targetCents - total;
        const hint = diff > 0 ? `Need ${diff}¢ more.` : `Too much by ${Math.abs(diff)}¢.`;
        return { correct: false, message: hint, meta: { total } };
      }

      const fewest = constraints.bonusFewestCoins;
      const bonus = typeof fewest === "number" && selectedIds.length <= fewest;
      return { correct: true, message: bonus ? "Exact change AND speedy!" : "Exact change!", meta: { total, bonus } };
    }

    case "CLOCK_READ": {
      const a = answer as { answers?: Record<string, string> };
      const answers = a?.answers ?? {};

      let wrong = 0;
      for (const r of puzzle.params.rounds) {
        const got = answers[r.id];
        if (typeof got !== "string" || got !== r.correctOption) wrong++;
      }

      if (wrong > 0) {
        return { correct: false, message: `Time’s tricky. ${wrong} clock${wrong === 1 ? "" : "s"} off.`, meta: { wrong } };
      }

      return { correct: true, message: "Clock cracked!", meta: { wrong } };
    }

    default:
      return { correct: false, message: "Puzzle type not implemented yet." };
  }
}
