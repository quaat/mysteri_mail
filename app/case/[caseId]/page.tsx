import { getCaseById } from "@/lib/content";
import { CaseClient } from "@/components/case/CaseClient";

export default function CasePage({ params }: { params: { caseId: string } }) {
  const c = getCaseById(params.caseId);
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
