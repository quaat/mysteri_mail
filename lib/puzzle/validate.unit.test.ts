import { describe, expect, it } from "vitest";

import case1 from "@/content/cases/case_001_ferret_mustache.json";
import case2 from "@/content/cases/case_002_banana_in_the_mailbox.json";
import case3 from "@/content/cases/case_003_the_missing_pie_chart.json";
import { CaseSchema, type CaseContent, type PuzzleContent } from "@/lib/schema/caseSchema";

import { pickQuip, validatePuzzle } from "./validate";

const parsedCase1 = CaseSchema.parse(case1);
const parsedCase2 = CaseSchema.parse(case2);
const parsedCase3 = CaseSchema.parse(case3);

function getPuzzle(caseContent: CaseContent, puzzleId: string): PuzzleContent {
  const puzzle = caseContent.puzzles.find((p) => p.id === puzzleId);
  if (!puzzle) {
    throw new Error(`Puzzle not found: ${puzzleId}`);
  }
  return puzzle;
}

describe("pickQuip", () => {
  it("returns empty string for an empty quip list", () => {
    expect(pickQuip([], 7)).toBe("");
  });

  it("picks deterministically with negative salt", () => {
    const quips = ["alpha", "bravo", "charlie"];
    expect(pickQuip(quips, -1)).toBe("bravo");
    expect(pickQuip(quips, -8)).toBe("charlie");
  });
});

describe("validatePuzzle edge cases", () => {
  it("STAMP_SUM rejects empty selection", () => {
    const puzzle = getPuzzle(parsedCase1, "p1_stamp_sum");
    const result = validatePuzzle(puzzle, []);

    expect(result.correct).toBe(false);
    expect(result.message).toBe("Add some stamps to the envelope.");
  });

  it("STAMP_SUM enforces max stamp count", () => {
    const puzzle = getPuzzle(parsedCase1, "p1_stamp_sum");
    const result = validatePuzzle(puzzle, ["st_one", "st_one", "st_one", "st_one", "st_one", "st_one", "st_one"]);

    expect(result.correct).toBe(false);
    expect(result.message).toBe("Too many stamps! Max is 6.");
  });

  it("STAMP_SUM enforces required companion stamp", () => {
    const puzzle = getPuzzle(parsedCase1, "p1_stamp_sum");
    const result = validatePuzzle(puzzle, ["st_twenty", "st_ten", "st_five", "st_glitter_plus3"]);

    expect(result.correct).toBe(false);
    expect(result.message).toContain("demands its friend");
  });

  it("STAMP_SUM returns deficit hint and total meta", () => {
    const puzzle = getPuzzle(parsedCase1, "p1_stamp_sum");
    const result = validatePuzzle(puzzle, ["st_ten"]);

    expect(result.correct).toBe(false);
    expect(result.message).toBe("You need 27¢ more.");
    expect(result.meta).toMatchObject({ total: 10 });
  });

  it("STAMP_SUM marks bonus for efficient exact answer", () => {
    const puzzle = getPuzzle(parsedCase1, "p1_stamp_sum");
    const result = validatePuzzle(puzzle, ["st_twenty", "st_ten", "st_five", "st_two"]);

    expect(result.correct).toBe(true);
    expect(result.message).toBe("Perfect—and super efficient!");
    expect(result.meta).toMatchObject({ total: 37, bonus: true });
  });

  it("MAILBAG_BALANCE reports both sides when incorrect", () => {
    const puzzle = getPuzzle(parsedCase1, "p2_mailbag_balance");
    const result = validatePuzzle(puzzle, { leftIds: [], rightIds: [] });

    expect(result.correct).toBe(false);
    expect(result.message).toBe("Not yet. Left is 0, right is 0. Both must be 25.");
    expect(result.meta).toMatchObject({ leftTotal: 0, rightTotal: 0 });
  });

  it("MAILBAG_BALANCE accepts balanced totals", () => {
    const puzzle = getPuzzle(parsedCase1, "p2_mailbag_balance");
    const result = validatePuzzle(puzzle, {
      leftIds: ["pa_sealed_16", "pa_movable_9"],
      rightIds: ["pb_sealed_12", "pb_movable_8", "pa_movable_5"],
    });

    expect(result.correct).toBe(true);
    expect(result.message).toBe("Balanced to perfection!");
    expect(result.meta).toMatchObject({ leftTotal: 25, rightTotal: 25 });
  });

  it("BUBBLE_POP_DIFFERENCE enforces operation requirement", () => {
    const puzzle = getPuzzle(parsedCase1, "p3_bubble_pop_difference");
    const result = validatePuzzle(puzzle, "bb_bread_18_6");

    expect(result.correct).toBe(false);
    expect(result.message).toBe("Right number maybe… wrong operation!");
  });

  it("EVIDENCE_TAPE_PATH enforces exact pick count when required", () => {
    const puzzle = getPuzzle(parsedCase1, "p4_evidence_tape_path");
    const result = validatePuzzle(puzzle, ["mc_plus10", "mc_plus5"]);

    expect(result.correct).toBe(false);
    expect(result.message).toBe("Use exactly 3 cards. You used 2.");
  });

  it("EVIDENCE_TAPE_PATH enforces upper limit when exact count is optional", () => {
    const puzzle = getPuzzle(parsedCase1, "p4_evidence_tape_path");
    const optionalPickCountPuzzle = {
      ...puzzle,
      params: { ...puzzle.params, mustUseExactlyPickCount: false },
    };
    const result = validatePuzzle(optionalPickCountPuzzle, ["mc_plus10", "mc_plus5", "mc_minus2", "mc_plus1"]);

    expect(result.correct).toBe(false);
    expect(result.message).toBe("You can use up to 3 cards.");
  });

  it("NUMBER_INPUT_QUIZ reports wrong answer count", () => {
    const puzzle = getPuzzle(parsedCase2, "p1_mul_quiz");
    const result = validatePuzzle(puzzle, { answers: { r1: 12, r2: 31, r3: 14 } });

    expect(result.correct).toBe(false);
    expect(result.message).toBe("Not quite. 1 round off.");
    expect(result.meta).toMatchObject({ wrong: 1 });
  });

  it("COIN_SUM rejects answers over max coin count", () => {
    const puzzle = getPuzzle(parsedCase2, "p3_coin_sum");
    const result = validatePuzzle(puzzle, ["c1", "c1", "c1", "c1", "c1", "c1", "c1", "c1", "c1", "c1", "c1"]);

    expect(result.correct).toBe(false);
    expect(result.message).toBe("Too many coins! Max is 10.");
  });

  it("CLOCK_READ reports singular grammar for one incorrect clock", () => {
    const puzzle = getPuzzle(parsedCase2, "p4_clock_read");
    const result = validatePuzzle(puzzle, { answers: { t1: "3:15", t2: "6:30", t3: "9:50" } });

    expect(result.correct).toBe(false);
    expect(result.message).toBe("Time’s tricky. 1 clock off.");
    expect(result.meta).toMatchObject({ wrong: 1 });
  });

  it("FRACTION_PIE_SUM returns helpful fraction diff", () => {
    const puzzle = getPuzzle(parsedCase3, "p1_fraction_pie");
    const result = validatePuzzle(puzzle, ["sl_4"]); // 4/8 instead of 6/8

    expect(result.correct).toBe(false);
    expect(result.message).toBe("You need 2/8 more.");
    expect(result.meta).toMatchObject({ totalNum: 4 });
  });

  it("PERCENT_SPRINKLE rejects wrong count", () => {
    const puzzle = getPuzzle(parsedCase3, "p3_percent_sprinkle");
    const result = validatePuzzle(puzzle, ["i0", "i1"]);

    expect(result.correct).toBe(false);
    expect(result.message).toContain("Target is 5");
  });

  it("FDP_TRIO_MATCH rejects a mismatched trio", () => {
    const puzzle = getPuzzle(parsedCase3, "p4_trio_match");
    const result = validatePuzzle(puzzle, {
      matches: [
        { fractionId: "f_half", decimalId: "d_half", percentId: "p_half" },
        { fractionId: "f_quarter", decimalId: "d_quarter", percentId: "p_tenth" },
        { fractionId: "f_three_quarters", decimalId: "d_three_quarters", percentId: "p_three_quarters" },
        { fractionId: "f_tenth", decimalId: "d_tenth", percentId: "p_quarter" },
      ],
    });

    expect(result.correct).toBe(false);
    expect(result.message).toContain("mismatched");
  });
});
