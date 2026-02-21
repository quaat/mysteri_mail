import Link from "next/link";

import { getAllCases, getCaseById } from "@/lib/content";
import { PuzzleClient } from "@/components/puzzles/PuzzleClient";

export function generateStaticParams() {
  try {
    return getAllCases().flatMap((c) => c.puzzles.map((p) => ({ caseId: c.caseId, puzzleId: p.id })));
  } catch {
    return [];
  }
}

export default async function PuzzlePage({
  params,
}: {
  params: Promise<{ caseId: string; puzzleId: string }>;
}) {
  const { caseId, puzzleId } = await params;
  const c = getCaseById(caseId);
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

  const p = c.puzzles.find((x) => x.id === puzzleId);
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
