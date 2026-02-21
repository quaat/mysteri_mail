import Link from "next/link";
import { getAllCases, getCaseById } from "@/lib/content";
import { RevealClient } from "@/components/reveal/RevealClient";

export function generateStaticParams() {
  try {
    return getAllCases().map((c) => ({ caseId: c.caseId }));
  } catch {
    return [];
  }
}

export default async function RevealPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const c = getCaseById(caseId);
  if (!c) {
    return (
      <div className="grid gap-2">
        <h1 className="text-2xl font-black">Case not found</h1>
        <Link className="underline" href="/">Go home</Link>
      </div>
    );
  }
  return <RevealClient c={c} />;
}
