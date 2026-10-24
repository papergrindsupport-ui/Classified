import raw from "./classification.json";
import { SESSION_SHORT, getSessionsFor, getVariantsFor, type SessionId } from "./papers";

export type ClPart = { p: string; t: string[]; l: string[] };
export type ClQuestion = { q: string; parts: ClPart[] };

export type PaperInfo = {
  key: string;
  year: number;
  session: SessionId;
  variant: string;
  label: string;
};

function buildPapers(): PaperInfo[] {
  const out: PaperInfo[] = [];
  const years = Array.from({ length: 2026 - 2016 + 1 }, (_, i) => 2016 + i);
  for (const year of years) {
    for (const session of getSessionsFor("biology", year)) {
      for (const variant of getVariantsFor(session)) {
        out.push({
          key: `${year}-${session}-${variant}`,
          year,
          session,
          variant,
          label: `${year} ${SESSION_SHORT[session]} ${variant}`,
        });
      }
    }
  }
  return out;
}

export const PAPERS: PaperInfo[] = buildPapers();
export const PAPER_BY_KEY = new Map(PAPERS.map((p) => [p.key, p]));
export const TOTAL_PAPERS = PAPERS.length;

export const CLASSIFICATION = raw as unknown as Record<string, ClQuestion[]>;

export function getQuestions(paperKey: string): ClQuestion[] {
  return CLASSIFICATION[paperKey] ?? [];
}
