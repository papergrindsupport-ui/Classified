import raw from "./classification.json";
import chemRaw from "./chemClassification.json";
import {
  SESSION_SHORT,
  getSessionsFor,
  getVariantsFor,
  type SessionId,
  type SubjectId,
} from "./papers";

export type ClPart = { p: string; t: string[]; l: string[] };
export type ClQuestion = { q: string; parts: ClPart[] };

export type PaperInfo = {
  key: string;
  year: number;
  session: SessionId;
  variant: string;
  label: string;
};

export function buildPapers(subject: SubjectId): PaperInfo[] {
  const out: PaperInfo[] = [];
  const years = Array.from({ length: 2026 - 2016 + 1 }, (_, i) => 2016 + i);
  for (const year of years) {
    for (const session of getSessionsFor(subject, year)) {
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

// ---------------- Biology ----------------
export const PAPERS: PaperInfo[] = buildPapers("biology");
export const PAPER_BY_KEY = new Map(PAPERS.map((p) => [p.key, p]));
export const TOTAL_PAPERS = PAPERS.length;

export const CLASSIFICATION = raw as unknown as Record<string, ClQuestion[]>;

export function getQuestions(paperKey: string): ClQuestion[] {
  return CLASSIFICATION[paperKey] ?? [];
}

// ---------------- Chemistry ----------------
export const CHEM_PAPERS: PaperInfo[] = buildPapers("chemistry");
export const CHEM_CLASSIFICATION = chemRaw as unknown as Record<string, ClQuestion[]>;

export function getChemQuestions(paperKey: string): ClQuestion[] {
  return CHEM_CLASSIFICATION[paperKey] ?? [];
}
