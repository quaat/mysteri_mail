import { describe, it, expect } from "vitest";

import { CaseSchema } from "@/lib/schema/caseSchema";
import { validatePuzzle } from "@/lib/puzzle/validate";
import case1 from "@/content/cases/case_001_ferret_mustache.json";
import case2 from "@/content/cases/case_002_banana_in_the_mailbox.json";
import case3 from "@/content/cases/case_003_the_missing_pie_chart.json";

describe("case content schemas", () => {
  it("parses case 001", () => {
    const parsed = CaseSchema.parse(case1);
    expect(parsed.caseId).toBe("case_001_ferret_mustache");
  });

  it("parses case 002", () => {
    const parsed = CaseSchema.parse(case2);
    expect(parsed.caseId).toBe("case_002_banana_in_the_mailbox");
  });

  it("parses case 003", () => {
    const parsed = CaseSchema.parse(case3);
    expect(parsed.caseId).toBe("case_003_the_missing_pie_chart");
  });
});

describe("puzzle validators", () => {
  it("validates STAMP_SUM", () => {
    const c = CaseSchema.parse(case1);
    const p = c.puzzles.find((x) => x.id === "p1_stamp_sum")!;
    const res = validatePuzzle(p, ["st_twenty", "st_ten", "st_five", "st_two"]);
    expect(res.correct).toBe(true);
  });

  it("validates COIN_SUM", () => {
    const c = CaseSchema.parse(case2);
    const p = c.puzzles.find((x) => x.id === "p3_coin_sum")!;
    const res = validatePuzzle(p, ["c25", "c25", "c10", "c5"]);
    expect(res.correct).toBe(true);
  });

  it("validates NUMBER_INPUT_QUIZ", () => {
    const c = CaseSchema.parse(case2);
    const p = c.puzzles.find((x) => x.id === "p1_mul_quiz")!;
    const res = validatePuzzle(p, { answers: { r1: 12, r2: 30, r3: 14 } });
    expect(res.correct).toBe(true);
  });

  it("validates CLOCK_READ", () => {
    const c = CaseSchema.parse(case2);
    const p = c.puzzles.find((x) => x.id === "p4_clock_read")!;
    const res = validatePuzzle(p, { answers: { t1: "3:15", t2: "6:30", t3: "9:05" } });
    expect(res.correct).toBe(true);
  });

  it("validates FRACTION_PIE_SUM", () => {
    const c = CaseSchema.parse(case3);
    const p = c.puzzles.find((x) => x.id === "p1_fraction_pie")!;
    const res = validatePuzzle(p, ["sl_4", "sl_2"]);
    expect(res.correct).toBe(true);
  });

  it("validates DECIMAL_NUMBER_LINE", () => {
    const c = CaseSchema.parse(case3);
    const p = c.puzzles.find((x) => x.id === "p2_decimal_line")!;
    const res = validatePuzzle(p, { answers: { d1: 0.6, d2: 1.25, d3: 0.75 } });
    expect(res.correct).toBe(true);
  });

  it("validates PERCENT_SPRINKLE", () => {
    const c = CaseSchema.parse(case3);
    const p = c.puzzles.find((x) => x.id === "p3_percent_sprinkle")!;
    const res = validatePuzzle(p, ["i0", "i1", "i2", "i3", "i4"]);
    expect(res.correct).toBe(true);
  });

  it("validates FDP_TRIO_MATCH", () => {
    const c = CaseSchema.parse(case3);
    const p = c.puzzles.find((x) => x.id === "p4_trio_match")!;
    const res = validatePuzzle(p, {
      matches: [
        { fractionId: "f_half", decimalId: "d_half", percentId: "p_half" },
        { fractionId: "f_quarter", decimalId: "d_quarter", percentId: "p_quarter" },
        { fractionId: "f_three_quarters", decimalId: "d_three_quarters", percentId: "p_three_quarters" },
        { fractionId: "f_tenth", decimalId: "d_tenth", percentId: "p_tenth" },
      ],
    });
    expect(res.correct).toBe(true);
  });
});
