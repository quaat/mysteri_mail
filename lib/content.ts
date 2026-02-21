import { CaseSchema, type CaseContent } from "@/lib/schema/caseSchema";
import { rawCases } from "@/content";

export function getAllCases(): CaseContent[] {
  return rawCases.map((c) => {
    const parsed = CaseSchema.safeParse(c);
    if (!parsed.success) {
      // Throwing will show the Next.js error overlay in dev.
      // In prod, we render a friendly error page via try/catch at call sites.
      throw new Error(
        `Invalid case JSON for ${String((c as any).caseId ?? "<unknown>")}: ${parsed.error.message}`
      );
    }
    return parsed.data;
  });
}

export function getCaseById(caseId: string): CaseContent | undefined {
  const all = getAllCases();
  return all.find((c) => c.caseId === caseId);
}
