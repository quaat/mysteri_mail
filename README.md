# Mysteri Mail 🕵️📬

A playful, story-driven kids math mystery game.

- **Platform:** Next.js 15 (App Router)
- **UI:** Tailwind + small headless UI primitives
- **State:** `zustand` + `localStorage`
- **Puzzles:** Content-driven JSON case files validated by `zod`

## What’s included

- **Case 001:** Addition/subtraction mini-games (stamps, balancing bags, bubble pop, route tape)
- **Case 002:** Multiplication/division + money + time mini-games (combo quiz, coin drawer, analog clocks)
- **Parents / Teacher page:** Local topic stats and progress overview

## Getting started

Use Node.js `20.19.0` or newer:

```bash
nvm use
```

```bash
npm install
npm run dev
```

Then open: `http://localhost:3000`

## Where the content lives

All case content is JSON in:

- `content/cases/`

The schema is enforced at runtime:

- `lib/schema/caseSchema.ts`

Cases are loaded via:

- `lib/content.ts`

## Adding a new case

1. Duplicate an existing case JSON in `content/cases/`.
2. Update IDs (caseId, puzzles, evidence, suspects).
3. Add the new import to `content/index.ts`.
4. Run tests:

```bash
npm test
```

## Puzzle types

Implemented:

- `STAMP_SUM` (add/sub)
- `MAILBAG_BALANCE` (add/sub)
- `BUBBLE_POP_DIFFERENCE` (add/sub)
- `EVIDENCE_TAPE_PATH` (add/sub)
- `NUMBER_INPUT_QUIZ` (mul/div, mixed)
- `COIN_SUM` (money)
- `CLOCK_READ` (time)

Validators live in:

- `lib/puzzle/validate.ts`

## Optional sound effects

Sound plays via tiny WebAudio beeps by default.

If you want real SFX, drop files into:

- `public/sfx/` (e.g. `stamp.mp3`, `success.mp3`, `fail.mp3`)

…and update `lib/sfx.ts` if needed.

## Notes

- No accounts, no analytics.
- Progress stays local in the browser.

Have fun (and don’t mail bananas).
