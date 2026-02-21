import { getAllCases, getCaseById } from "@/lib/content";
import { CaseClient } from "@/components/case/CaseClient";

export function generateStaticParams() {
  try {
    return getAllCases().map((c) => ({ caseId: c.caseId }));
  } catch {
    return [];
  }
}

export default async function CasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const c = getCaseById(caseId);
  if (!c) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-black">Case not found</h1>
        <p className="text-black/70">That mailbox label doesn’t exist.</p>
      </div>
    );
  }

  return <CaseClient c={c} />;
}
