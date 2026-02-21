import { describe, expect, it } from "vitest";
import { validatePuzzle } from "./validate";
import case1 from "@/content/cases/case_001_ferret_mustache.json";
import { CaseSchema } from "@/lib/schema/caseSchema";

const parsed = CaseSchema.parse(case1);

describe("validatePuzzle", () => {
  it("validates STAMP_SUM correct solution", () => {
    const p = parsed.puzzles.find((x) => x.id === "p1_stamp_sum")!;
    // One solution: 20 + 10 + 5 + 3 + (-1) = 37
    const res = validatePuzzle(p, ["st_twenty", "st_ten", "st_five", "st_glitter_plus3", "st_coupon_worm_minus1"]);
    expect(res.correct).toBe(true);
  });

  it("rejects STAMP_SUM if missing required stamp", () => {
    const p = parsed.puzzles.find((x) => x.id === "p1_stamp_sum")!;
    const res = validatePuzzle(p, ["st_twenty", "st_ten", "st_five", "st_glitter_plus3"]);
    expect(res.correct).toBe(false);
  });

  it("validates BUBBLE_POP_DIFFERENCE correct bubble", () => {
    const p = parsed.puzzles.find((x) => x.id === "p3_bubble_pop_difference")!;
    const res = validatePuzzle(p, "bb_pigeons_43_19");
    expect(res.correct).toBe(true);
  });

  it("validates EVIDENCE_TAPE_PATH one correct route", () => {
    const p = parsed.puzzles.find((x) => x.id === "p4_evidence_tape_path")!;
    // 10 +10 +5 -2 = 23
    const res = validatePuzzle(p, ["mc_plus10", "mc_plus5", "mc_minus2"]);
    expect(res.correct).toBe(true);
  });
});
