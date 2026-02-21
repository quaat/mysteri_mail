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

    case "PERIMETER_WALK": {
      const raw = typeof answer === "number" ? answer : typeof answer === "string" ? Number(answer) : NaN;
      if (!Number.isFinite(raw)) return { correct: false, message: "Type a number for the perimeter." };

      const expected = puzzle.params.correctPerimeter;
      if (raw !== expected) {
        const diff = expected - raw;
        const hint = diff > 0 ? `You are ${diff} too low.` : `You are ${Math.abs(diff)} too high.`;
        return { correct: false, message: `Not quite. ${hint}`, meta: { expected } };
      }
      return { correct: true, message: "Perimeter captured!", meta: { expected } };
    }

    case "AREA_RECT_BUILDER": {
      const a = answer as { rows?: number; cols?: number };
      const rows = typeof a?.rows === "number" ? a.rows : NaN;
      const cols = typeof a?.cols === "number" ? a.cols : NaN;
      if (!Number.isFinite(rows) || !Number.isFinite(cols)) {
        return { correct: false, message: "Pick rows and columns for your rectangle." };
      }

      const { targetArea, requiredPerimeter } = puzzle.params;
      const area = rows * cols;
      if (area !== targetArea) {
        return { correct: false, message: `Area is ${area}, but target is ${targetArea}.`, meta: { area } };
      }
      if (typeof requiredPerimeter === "number") {
        const per = 2 * (rows + cols);
        if (per !== requiredPerimeter) {
          return {
            correct: false,
            message: `Area matches, but perimeter is ${per}. Need ${requiredPerimeter}.`,
            meta: { per },
          };
        }
      }

      return { correct: true, message: "Blueprint approved!", meta: { area } };
    }

    case "ANGLE_CLASSIFY": {
      const a = answer as { answers?: Record<string, string> };
      const answers = a?.answers ?? {};

      let wrong = 0;
      for (const r of puzzle.params.rounds) {
        const got = answers[r.id];
        if (typeof got !== "string" || got !== r.correctOption) wrong++;
      }

      if (wrong > 0) {
        return {
          correct: false,
          message: `Angle alert! ${wrong} choice${wrong === 1 ? "" : "s"} off.`,
          meta: { wrong },
        };
      }

      return { correct: true, message: "Angles identified!", meta: { wrong } };
    }

    case "SYMMETRY_PICK": {
      const a = answer as { answers?: Record<string, string> };
      const answers = a?.answers ?? {};

      let wrong = 0;
      for (const r of puzzle.params.rounds) {
        const got = answers[r.id];
        if (typeof got !== "string" || got !== r.correctOption) wrong++;
      }

      if (wrong > 0) {
        return {
          correct: false,
          message: `Mirror, mirror… ${wrong} doodle${wrong === 1 ? "" : "s"} still lopsided.`,
          meta: { wrong },
        };
      }

      return { correct: true, message: "Symmetry secured!", meta: { wrong } };
    }

    case "FRACTION_PIE_SUM": {
      const selectedIds = Array.isArray(answer) ? (answer as string[]) : [];
      const { denominator, targetNumerator, slices, constraints } = puzzle.params;

      if (selectedIds.length === 0) return { correct: false, message: "Add some slices to the plate." };
      if (selectedIds.length > constraints.maxSlices) {
        return { correct: false, message: `Too many slices! Max is ${constraints.maxSlices}.` };
      }

      const byId = new Map(slices.map((s) => [s.id, s] as const));
      const totalNum = selectedIds.reduce((acc, id) => acc + (byId.get(id)?.numerator ?? 0), 0);

      if (totalNum !== targetNumerator) {
        const diff = targetNumerator - totalNum;
        const hint = diff > 0 ? `You need ${diff}/${denominator} more.` : `Too much by ${Math.abs(diff)}/${denominator}.`;
        return { correct: false, message: hint, meta: { totalNum } };
      }

      const fewest = constraints.bonusFewestSlices;
      const bonus = typeof fewest === "number" && selectedIds.length <= fewest;
      return {
        correct: true,
        message: bonus ? "Perfect slice math—and super efficient!" : "Perfect fraction!",
        meta: { totalNum, bonus },
      };
    }

    case "DECIMAL_NUMBER_LINE": {
      const a = answer as { answers?: Record<string, number> };
      const answers = a?.answers ?? {};
      const tol = puzzle.params.tolerance ?? 0;

      let wrong = 0;
      for (const r of puzzle.params.rounds) {
        const got = answers[r.id];
        if (typeof got !== "number") {
          wrong++;
          continue;
        }
        const ok = tol === 0 ? got === r.target : Math.abs(got - r.target) <= tol;
        if (!ok) wrong++;
      }

      if (wrong > 0) {
        return {
          correct: false,
          message: `Almost. ${wrong} mark${wrong === 1 ? "" : "s"} off on the number line.`,
          meta: { wrong },
        };
      }

      return { correct: true, message: "Decimal detective work complete!", meta: { wrong } };
    }

    case "PERCENT_SPRINKLE": {
      const selected = Array.isArray(answer) ? (answer as (string | number)[]) : [];
      const uniqueCount = new Set(selected.map(String)).size;
      const need = puzzle.params.requiredCount;

      if (uniqueCount === 0) return { correct: false, message: "Pick some items to paint." };

      if (uniqueCount !== need) {
        const diff = need - uniqueCount;
        const hint = diff > 0 ? `Paint ${diff} more.` : `Unpaint ${Math.abs(diff)}.`;
        return { correct: false, message: `${hint} Target is ${need} (${puzzle.params.targetPercent}%).`, meta: { uniqueCount } };
      }

      return { correct: true, message: "Percent perfectly painted!", meta: { uniqueCount } };
    }

    case "FDP_TRIO_MATCH": {
      const a = answer as { matches?: Array<{ fractionId: string; decimalId: string; percentId: string }> };
      const matches = Array.isArray(a?.matches) ? a.matches : [];

      const byFraction = new Map(puzzle.params.trios.map((t) => [t.fraction.id, t] as const));
      const needed = puzzle.params.trios.length;
      if (matches.length !== needed) {
        return { correct: false, message: `Finish all matches. ${matches.length}/${needed} complete.`, meta: { done: matches.length } };
      }

      const fracSet = new Set<string>();
      const decSet = new Set<string>();
      const pctSet = new Set<string>();
      let wrong = 0;

      for (const m of matches) {
        fracSet.add(m.fractionId);
        decSet.add(m.decimalId);
        pctSet.add(m.percentId);

        const trio = byFraction.get(m.fractionId);
        if (!trio) {
          wrong++;
          continue;
        }
        if (trio.decimal.id !== m.decimalId || trio.percent.id !== m.percentId) wrong++;
      }

      if (fracSet.size !== needed || decSet.size !== needed || pctSet.size !== needed) {
        return { correct: false, message: "Each card can only be used once. No double-dipping!", meta: { wrong } };
      }

      if (wrong > 0) {
        return { correct: false, message: `So close—${wrong} trio${wrong === 1 ? "" : "s"} mismatched.`, meta: { wrong } };
      }

      return { correct: true, message: "Triple match complete!", meta: { wrong } };
    }

    default:
      return { correct: false, message: "Puzzle type not implemented yet." };
  }
}
