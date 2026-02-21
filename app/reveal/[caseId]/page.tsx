import Link from "next/link";
import { getCaseById } from "@/lib/content";
import { RevealClient } from "@/components/reveal/RevealClient";

export default function RevealPage({ params }: { params: { caseId: string } }) {
  const c = getCaseById(params.caseId);
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
