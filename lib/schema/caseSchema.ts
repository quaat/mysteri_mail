import { z } from "zod";

const IdSchema = z.string().regex(/^[a-z][a-z0-9_]*$/);
const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const NonEmpty = z.string().min(1);

export const DifficultyBandSchema = z.union([
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const TopicKeySchema = z.enum([
  "add_sub",
  "mul_div",
  "money",
  "time",
  "geometry",
  "fractions",
  "decimals",
  "percent",
  "mixed",
]);

export const EvidenceSchema = z
  .object({
    id: IdSchema,
    label: NonEmpty,
    description: NonEmpty,
    spriteKey: NonEmpty,
  })
  .strict();

export const SuspectSchema = z
  .object({
    id: IdSchema,
    name: NonEmpty,
    roleTagline: NonEmpty,
    portraitKey: NonEmpty,
    alibi: z
      .object({
        claim: NonEmpty,
        note: NonEmpty,
      })
      .strict(),
    quips: z.array(NonEmpty).min(1),
  })
  .strict();

export const LocationSchema = z
  .object({
    id: IdSchema,
    name: NonEmpty,
    backgroundKey: NonEmpty,
    description: NonEmpty,
  })
  .strict();

export const LetterSchema = z
  .object({
    fromName: NonEmpty,
    toName: NonEmpty,
    subjectLine: NonEmpty,
    bodyParagraphs: z.array(NonEmpty).min(1),
    signature: NonEmpty,
    postmark: z
      .object({
        city: NonEmpty,
        dateISO: IsoDateSchema,
        stampSlogan: NonEmpty,
      })
      .strict(),
  })
  .strict();

const PuzzleUiSchema = z
  .object({
    introLine: NonEmpty.optional(),
    successQuips: z.array(NonEmpty).min(1),
    failQuips: z.array(NonEmpty).min(1),
  })
  .strict();

const PuzzleBaseSchema = z
  .object({
    id: IdSchema,
    type: z.string(),
    title: NonEmpty,
    prompt: NonEmpty,
    topicKey: TopicKeySchema,
    difficulty: z.number().int().min(1).max(5),
    seed: z.number().int().nonnegative(),
    points: z.number().int().min(0).default(10),
    timeLimitSec: z.number().int().min(0).optional(),
    unlocksEvidenceId: IdSchema,
    ui: PuzzleUiSchema,
    hints: z.array(NonEmpty).max(5).optional(),
  })
  .strict();

// STAMP_SUM
const StampSchema = z
  .object({
    id: IdSchema,
    label: NonEmpty,
    valueCents: z.number().int().refine((n) => n !== 0, "valueCents cannot be 0"),
    spriteKey: NonEmpty,
    requiresStampId: IdSchema.optional(),
  })
  .strict();

const StampSumParamsSchema = z
  .object({
    targetCents: z.number().int(),
    stamps: z.array(StampSchema).min(4),
    constraints: z
      .object({
        maxStamps: z.number().int().min(1).max(12),
        bonusFewestStamps: z.number().int().min(1).max(12).optional(),
      })
      .strict(),
  })
  .strict();

const StampSumPuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("STAMP_SUM"),
  params: StampSumParamsSchema,
}).strict();

// MAILBAG_BALANCE
const ParcelSchema = z
  .object({
    id: IdSchema,
    label: NonEmpty,
    value: z.number().int(),
    spriteKey: NonEmpty,
    movable: z.boolean().default(true),
  })
  .strict();

const MailbagBalanceParamsSchema = z
  .object({
    targetWeight: z.number().int(),
    leftBag: z.array(ParcelSchema).min(1),
    rightBag: z.array(ParcelSchema).min(1),
    showTargetOnBags: z.boolean().default(true),
  })
  .strict();

const MailbagBalancePuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("MAILBAG_BALANCE"),
  params: MailbagBalanceParamsSchema,
}).strict();

// BUBBLE_POP_DIFFERENCE
const OpSchema = z.enum(["add", "sub"]);

const BubbleExpressionSchema = z
  .object({
    a: z.number().int(),
    b: z.number().int(),
    op: OpSchema,
  })
  .strict();

const BubbleSchema = z
  .object({
    id: IdSchema,
    statement: NonEmpty,
    expression: BubbleExpressionSchema,
    spriteKey: NonEmpty,
    tag: z.enum(["silly", "serious", "dramatic", "suspicious"]).default("silly"),
  })
  .strict();

const BubblePopParamsSchema = z
  .object({
    goalValue: z.number().int(),
    required: z
      .object({
        op: OpSchema.optional(),
        mustUseNumbers: z.array(z.number().int()).min(1).optional(),
      })
      .strict()
      .default({}),
    bubbles: z.array(BubbleSchema).min(4),
  })
  .strict();

const BubblePopDifferencePuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("BUBBLE_POP_DIFFERENCE"),
  params: BubblePopParamsSchema,
}).strict();

// EVIDENCE_TAPE_PATH
const MoveCardSchema = z
  .object({
    id: IdSchema,
    label: NonEmpty,
    delta: z.number().int(),
    spriteKey: NonEmpty,
  })
  .strict();

const EvidenceTapePathParamsSchema = z
  .object({
    start: z.number().int(),
    target: z.number().int(),
    pickCount: z.number().int().min(1).max(6),
    moveCards: z.array(MoveCardSchema).min(4),
    mustUseExactlyPickCount: z.boolean().default(true),
  })
  .strict();

const EvidenceTapePathPuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("EVIDENCE_TAPE_PATH"),
  params: EvidenceTapePathParamsSchema,
}).strict();

// NUMBER_INPUT_QUIZ (multiplication/division/etc)
const NumberInputRoundSchema = z
  .object({
    id: IdSchema,
    question: NonEmpty,
    answer: z.number().int(),
    spriteKey: NonEmpty.optional(),
    solvedQuip: NonEmpty.optional(),
  })
  .strict();

const NumberInputQuizParamsSchema = z
  .object({
    rounds: z.array(NumberInputRoundSchema).min(3),
    maxMistakes: z.number().int().min(0).max(10).default(2),
  })
  .strict();

const NumberInputQuizPuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("NUMBER_INPUT_QUIZ"),
  params: NumberInputQuizParamsSchema,
}).strict();

// COIN_SUM (money)
const CoinSchema = z
  .object({
    id: IdSchema,
    label: NonEmpty,
    valueCents: z.number().int().refine((n) => n !== 0, "valueCents cannot be 0"),
    spriteKey: NonEmpty,
  })
  .strict();

const CoinSumParamsSchema = z
  .object({
    targetCents: z.number().int().min(0),
    coins: z.array(CoinSchema).min(4),
    constraints: z
      .object({
        maxCoins: z.number().int().min(1).max(20),
        bonusFewestCoins: z.number().int().min(1).max(20).optional(),
      })
      .strict(),
  })
  .strict();

const CoinSumPuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("COIN_SUM"),
  params: CoinSumParamsSchema,
}).strict();

// CLOCK_READ (analog clock reading)
const ClockRoundSchema = z
  .object({
    id: IdSchema,
    hour: z.number().int().min(1).max(12),
    minute: z.number().int().min(0).max(59),
    prompt: NonEmpty,
    options: z.array(NonEmpty).min(2).max(6),
    correctOption: NonEmpty,
  })
  .strict();

const ClockReadParamsSchema = z
  .object({
    rounds: z.array(ClockRoundSchema).min(3),
  })
  .strict();

const ClockReadPuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("CLOCK_READ"),
  params: ClockReadParamsSchema,
}).strict();

// PERIMETER_WALK (geometry)
const PerimeterSegmentSchema = z
  .object({
    id: IdSchema,
    label: NonEmpty,
    length: z.number().int().min(1),
    spriteKey: NonEmpty.optional(),
  })
  .strict();

const PerimeterWalkParamsSchema = z
  .object({
    segments: z.array(PerimeterSegmentSchema).min(4).max(12),
    correctPerimeter: z.number().int().min(1),
    unitLabel: NonEmpty.default("units"),
  })
  .strict()
  .superRefine((p, ctx) => {
    const sum = p.segments.reduce((acc, s) => acc + s.length, 0);
    if (p.correctPerimeter !== sum) {
      ctx.addIssue({
        code: "custom",
        message: `correctPerimeter should equal sum(segments) = ${sum}.`,
      });
    }
  });

const PerimeterWalkPuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("PERIMETER_WALK"),
  params: PerimeterWalkParamsSchema,
}).strict();

// AREA_RECT_BUILDER (geometry)
const AreaRectBuilderParamsSchema = z
  .object({
    targetArea: z.number().int().min(1),
    rowsMin: z.number().int().min(1),
    rowsMax: z.number().int().min(1),
    colsMin: z.number().int().min(1),
    colsMax: z.number().int().min(1),
    requiredPerimeter: z.number().int().min(1).optional(),
    unitLabel: NonEmpty.default("square units"),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.rowsMax < p.rowsMin) {
      ctx.addIssue({ code: "custom", message: "rowsMax must be >= rowsMin" });
    }
    if (p.colsMax < p.colsMin) {
      ctx.addIssue({ code: "custom", message: "colsMax must be >= colsMin" });
    }

    // Feasibility check: can we hit targetArea within ranges?
    let feasible = false;
    for (let r = p.rowsMin; r <= p.rowsMax; r++) {
      for (let c = p.colsMin; c <= p.colsMax; c++) {
        if (r * c !== p.targetArea) continue;
        if (typeof p.requiredPerimeter === "number" && 2 * (r + c) !== p.requiredPerimeter) continue;
        feasible = true;
      }
    }
    if (!feasible) {
      ctx.addIssue({
        code: "custom",
        message: "No rectangle in the given ranges satisfies targetArea (and requiredPerimeter if provided).",
      });
    }
  });

const AreaRectBuilderPuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("AREA_RECT_BUILDER"),
  params: AreaRectBuilderParamsSchema,
}).strict();

// ANGLE_CLASSIFY (geometry)
const AngleLabelSchema = z.enum(["acute", "right", "obtuse"]);

const AngleRoundSchema = z
  .object({
    id: IdSchema,
    degrees: z.number().int().min(10).max(170),
    prompt: NonEmpty,
    options: z.array(AngleLabelSchema).min(2).max(3),
    correctOption: AngleLabelSchema,
  })
  .strict()
  .superRefine((r, ctx) => {
    if (!r.options.includes(r.correctOption)) {
      ctx.addIssue({ code: "custom", message: `round ${r.id}: correctOption must be in options` });
    }
  });

const AngleClassifyParamsSchema = z
  .object({
    rounds: z.array(AngleRoundSchema).min(3).max(6),
    showDegrees: z.boolean().default(false),
  })
  .strict();

const AngleClassifyPuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("ANGLE_CLASSIFY"),
  params: AngleClassifyParamsSchema,
}).strict();

// SYMMETRY_PICK (geometry)
const SymmetryOptionSchema = z.enum(["vertical", "horizontal", "diagonal_left", "diagonal_right", "none"]);

const SymmetryRoundSchema = z
  .object({
    id: IdSchema,
    doodleKey: NonEmpty,
    prompt: NonEmpty,
    options: z.array(SymmetryOptionSchema).min(2).max(5),
    correctOption: SymmetryOptionSchema,
  })
  .strict()
  .superRefine((r, ctx) => {
    if (!r.options.includes(r.correctOption)) {
      ctx.addIssue({ code: "custom", message: `round ${r.id}: correctOption must be in options` });
    }
  });

const SymmetryPickParamsSchema = z
  .object({
    rounds: z.array(SymmetryRoundSchema).min(3).max(6),
  })
  .strict();

const SymmetryPickPuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("SYMMETRY_PICK"),
  params: SymmetryPickParamsSchema,
}).strict();

// FRACTION_PIE_SUM (fractions)
const FractionSliceSchema = z
  .object({
    id: IdSchema,
    label: NonEmpty,
    numerator: z.number().int().min(1),
    spriteKey: NonEmpty,
  })
  .strict();

const FractionPieSumParamsSchema = z
  .object({
    denominator: z.number().int().min(2).max(24),
    targetNumerator: z.number().int().min(1),
    slices: z.array(FractionSliceSchema).min(4),
    constraints: z
      .object({
        maxSlices: z.number().int().min(1).max(12),
        bonusFewestSlices: z.number().int().min(1).max(12).optional(),
      })
      .strict(),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.targetNumerator >= p.denominator) {
      ctx.addIssue({ code: "custom", message: "targetNumerator must be < denominator" });
    }
    for (const s of p.slices) {
      if (s.numerator >= p.denominator) {
        ctx.addIssue({ code: "custom", message: `slice ${s.id} numerator must be < denominator` });
      }
    }
  });

const FractionPieSumPuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("FRACTION_PIE_SUM"),
  params: FractionPieSumParamsSchema,
}).strict();

// DECIMAL_NUMBER_LINE (decimals)
const DecimalLineRoundSchema = z
  .object({
    id: IdSchema,
    min: z.number(),
    max: z.number(),
    step: z.number().positive(),
    target: z.number(),
    prompt: NonEmpty,
    showLabels: z.boolean().default(true),
  })
  .strict()
  .superRefine((r, ctx) => {
    if (!(r.max > r.min)) {
      ctx.addIssue({ code: "custom", message: `round ${r.id}: max must be > min` });
    }
    if (r.target < r.min || r.target > r.max) {
      ctx.addIssue({ code: "custom", message: `round ${r.id}: target must be within [min,max]` });
    }
  });

const DecimalNumberLineParamsSchema = z
  .object({
    rounds: z.array(DecimalLineRoundSchema).min(3).max(6),
    tolerance: z.number().nonnegative().default(0),
  })
  .strict();

const DecimalNumberLinePuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("DECIMAL_NUMBER_LINE"),
  params: DecimalNumberLineParamsSchema,
}).strict();

// PERCENT_SPRINKLE (percentages)
const PercentSprinkleParamsSchema = z
  .object({
    totalItems: z.number().int().min(8).max(60),
    targetPercent: z.number().int().min(5).max(95),
    requiredCount: z.number().int().min(0),
    itemSpriteKey: NonEmpty,
    itemLabelSingular: NonEmpty,
    itemLabelPlural: NonEmpty,
    gridCols: z.number().int().min(4).max(10).default(6),
  })
  .strict()
  .superRefine((p, ctx) => {
    const computed = (p.totalItems * p.targetPercent) / 100;
    if (!Number.isInteger(computed)) {
      ctx.addIssue({
        code: "custom",
        message: "totalItems * targetPercent must be divisible by 100 (so the answer is a whole number).",
      });
    }
    if (Number.isInteger(computed) && p.requiredCount !== computed) {
      ctx.addIssue({
        code: "custom",
        message: `requiredCount should be ${computed} for totalItems=${p.totalItems} and targetPercent=${p.targetPercent}.`,
      });
    }
  });

const PercentSprinklePuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("PERCENT_SPRINKLE"),
  params: PercentSprinkleParamsSchema,
}).strict();

// FDP_TRIO_MATCH (fraction/decimal/percent matching)
const FdpFractionSchema = z
  .object({
    id: IdSchema,
    label: NonEmpty,
    numerator: z.number().int().min(1),
    denominator: z.number().int().min(2),
  })
  .strict()
  .superRefine((f, ctx) => {
    if (f.numerator >= f.denominator) {
      ctx.addIssue({ code: "custom", message: `fraction ${f.id}: numerator must be < denominator` });
    }
  });

const FdpDecimalSchema = z
  .object({
    id: IdSchema,
    label: NonEmpty,
    value: z.number(),
  })
  .strict();

const FdpPercentSchema = z
  .object({
    id: IdSchema,
    label: NonEmpty,
    value: z.number(),
  })
  .strict();

const FdpTrioSchema = z
  .object({
    id: IdSchema,
    fraction: FdpFractionSchema,
    decimal: FdpDecimalSchema,
    percent: FdpPercentSchema,
  })
  .strict();

const FdpTrioMatchParamsSchema = z
  .object({
    trios: z.array(FdpTrioSchema).min(3).max(6),
    shuffleSeed: z.number().int().nonnegative().optional(),
  })
  .strict();

const FdpTrioMatchPuzzleSchema = PuzzleBaseSchema.extend({
  type: z.literal("FDP_TRIO_MATCH"),
  params: FdpTrioMatchParamsSchema,
}).strict();

export const PuzzleSchema = z.discriminatedUnion("type", [
  StampSumPuzzleSchema,
  MailbagBalancePuzzleSchema,
  BubblePopDifferencePuzzleSchema,
  EvidenceTapePathPuzzleSchema,
  NumberInputQuizPuzzleSchema,
  CoinSumPuzzleSchema,
  ClockReadPuzzleSchema,
  PerimeterWalkPuzzleSchema,
  AreaRectBuilderPuzzleSchema,
  AngleClassifyPuzzleSchema,
  SymmetryPickPuzzleSchema,
  FractionPieSumPuzzleSchema,
  DecimalNumberLinePuzzleSchema,
  PercentSprinklePuzzleSchema,
  FdpTrioMatchPuzzleSchema,
]);

export const FinalQuestionSchema = z
  .object({
    question: NonEmpty,
    options: z.array(IdSchema).min(2),
    correctSuspectId: IdSchema,
    correctRationale: z.array(NonEmpty).min(1),
    wrongRationales: z
      .array(
        z
          .object({
            suspectId: IdSchema,
            lines: z.array(NonEmpty).min(1),
          })
          .strict()
      )
      .optional(),
  })
  .strict();

export const RevealSchema = z
  .object({
    correct: z
      .object({
        headline: NonEmpty,
        bodyParagraphs: z.array(NonEmpty).min(1),
        cutsceneKey: NonEmpty.optional(),
        sfxKey: NonEmpty.optional(),
      })
      .strict(),
    incorrect: z
      .object({
        headline: NonEmpty,
        bodyParagraphs: z.array(NonEmpty).min(1),
      })
      .strict(),
  })
  .strict();

export const RewardStickerSchema = z
  .object({
    id: IdSchema,
    name: NonEmpty,
    spriteKey: NonEmpty,
    rarity: z.enum(["common", "rare", "legendary"]).default("common"),
  })
  .strict();

export const RewardBadgeSchema = z
  .object({
    id: IdSchema,
    name: NonEmpty,
    description: NonEmpty,
    iconKey: NonEmpty,
  })
  .strict();

export const RewardsSchema = z
  .object({
    xp: z.number().int().min(0).default(0),
    stickers: z.array(RewardStickerSchema).default([]),
    badges: z.array(RewardBadgeSchema).default([]),
  })
  .strict();

export const CaseSchema = z
  .object({
    version: z.literal(1),
    caseId: IdSchema,
    orderIndex: z.number().int().min(1),
    title: NonEmpty,
    summary: NonEmpty,
    difficultyBand: DifficultyBandSchema,
    estimatedMinutes: z.number().int().min(1).max(60),
    introLetter: LetterSchema,

    suspects: z.array(SuspectSchema).min(2),
    locations: z.array(LocationSchema).min(1),
    evidence: z.array(EvidenceSchema).min(1),
    puzzles: z.array(PuzzleSchema).min(1),

    finalQuestion: FinalQuestionSchema,
    reveal: RevealSchema,
    rewards: RewardsSchema,

    unlockNextCaseIds: z.array(IdSchema).default([]),
  })
  .strict()
  .superRefine((c, ctx) => {
    const uniq = (arr: string[]) => new Set(arr).size === arr.length;

    const suspectIds = c.suspects.map((s) => s.id);
    if (!uniq(suspectIds)) ctx.addIssue({ code: "custom", message: "Duplicate suspect.id found." });

    const evidenceIds = c.evidence.map((e) => e.id);
    if (!uniq(evidenceIds)) ctx.addIssue({ code: "custom", message: "Duplicate evidence.id found." });

    const puzzleIds = c.puzzles.map((p) => p.id);
    if (!uniq(puzzleIds)) ctx.addIssue({ code: "custom", message: "Duplicate puzzle.id found." });

    const evidenceSet = new Set(evidenceIds);
    for (const p of c.puzzles) {
      if (!evidenceSet.has(p.unlocksEvidenceId)) {
        ctx.addIssue({
          code: "custom",
          message: `Puzzle ${p.id} unlocksEvidenceId "${p.unlocksEvidenceId}" does not exist in evidence[].`,
        });
      }
    }

    const suspectSet = new Set(suspectIds);
    for (const sid of c.finalQuestion.options) {
      if (!suspectSet.has(sid)) {
        ctx.addIssue({
          code: "custom",
          message: `finalQuestion.options contains unknown suspectId "${sid}".`,
        });
      }
    }
    if (!suspectSet.has(c.finalQuestion.correctSuspectId)) {
      ctx.addIssue({
        code: "custom",
        message: `finalQuestion.correctSuspectId "${c.finalQuestion.correctSuspectId}" not found in suspects[].`,
      });
    }
    if (!c.finalQuestion.options.includes(c.finalQuestion.correctSuspectId)) {
      ctx.addIssue({
        code: "custom",
        message: `finalQuestion.correctSuspectId must be included in finalQuestion.options.`,
      });
    }
  });

export type CaseContent = z.infer<typeof CaseSchema>;
export type PuzzleContent = z.infer<typeof PuzzleSchema>;
