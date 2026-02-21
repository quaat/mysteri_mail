import Link from "next/link";

import { getCaseById } from "@/lib/content";
import { PuzzleClient } from "@/components/puzzles/PuzzleClient";

export default function PuzzlePage({
  params,
}: {
  params: { caseId: string; puzzleId: string };
}) {
  const c = getCaseById(params.caseId);
  if (!c) {
    return (
      <div className="grid gap-2">
        <h1 className="text-2xl font-black">Case not found</h1>
        <Link className="underline" href="/">
          Go home
        </Link>
      </div>
    );
  }

  const p = c.puzzles.find((x) => x.id === params.puzzleId);
  if (!p) {
    return (
      <div className="grid gap-2">
        <h1 className="text-2xl font-black">Puzzle not found</h1>
        <Link className="underline" href={`/case/${c.caseId}`}>
          Back to case
        </Link>
      </div>
    );
  }

  return <PuzzleClient c={c} p={p} />;
}
