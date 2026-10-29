export type SubjectId = "biology" | "chemistry";
export type SessionId = "feb" | "june" | "oct";

const YEARS = Array.from({ length: 2026 - 2016 + 1 }, (_, i) => 2016 + i);

export const SUBJECTS: {
  id: SubjectId;
  name: string;
  shortcut: string;
  code: string;
  years: number[];
}[] = [
  { id: "biology", name: "Biology", shortcut: "Bio", code: "0610", years: YEARS },
  { id: "chemistry", name: "Chemistry", shortcut: "Chem", code: "0620", years: YEARS },
];

export const SESSIONS: {
  id: SessionId;
  label: string;
  short: string;
  variants: string[];
}[] = [
  { id: "feb", label: "Feb / March", short: "F/M", variants: ["V2"] },
  {
    id: "june",
    label: "May / June",
    short: "M/J",
    variants: ["V1", "V2", "V3"],
  },
  { id: "oct", label: "Oct / Nov", short: "O/N", variants: ["V1", "V2", "V3"] },
];

export const SESSION_SHORT: Record<SessionId, string> = {
  feb: "F/M",
  june: "M/J",
  oct: "O/N",
};

export function getSubjectByShortcut(shortcut: string) {
  return SUBJECTS.find((s) => s.shortcut.toLowerCase() === shortcut.toLowerCase());
}

export function getSessionById(id: SessionId) {
  return SESSIONS.find((s) => s.id === id)!;
}

// Years without a Feb/March paper. Chemistry 2016 F/M 42 is classified, so
// it is kept.
const NO_FEB: Record<SubjectId, number[]> = {
  biology: [2016],
  chemistry: [],
};

export function getSessionsFor(subject: SubjectId, year: number): SessionId[] {
  const all: SessionId[] = ["feb", "june", "oct"];
  return all.filter((s) => !(s === "feb" && NO_FEB[subject].includes(year)));
}

export function getVariantsFor(session: SessionId): string[] {
  return SESSIONS.find((s) => s.id === session)?.variants ?? [];
}

export function getSubject(id: SubjectId) {
  return SUBJECTS.find((s) => s.id === id)!;
}

// --------------------------------------------------
// Paper links
// --------------------------------------------------

export type PaperLink = {
  qp?: string | null;
  ms?: string | null;
};

const SESSION_CODE: Record<SessionId, string> = {
  feb: "m",
  june: "s",
  oct: "w",
};

const BEH = "https://bestexamhelp.com/exam/cambridge-igcse";

const OVERRIDES: Record<string, PaperLink> = {
  "biology-2026-feb-V2": {
    qp: `${BEH}/biology-0610/2026/0610_m26_qp_42.pdf`,
    ms: `${BEH}/biology-0610/2026/0610_m26_ms_42.pdf`,
  },
  "biology-2026-june-V1": {
    qp: `${BEH}/biology-0610/2026/0610_s26_qp_41.pdf`,
    ms: `${BEH}/biology-0610/2026/0610_s26_ms_41.pdf`,
  },
  "biology-2026-june-V2": {
    qp: `${BEH}/biology-0610/2026/0610_s26_qp_42.pdf`,
    ms: `${BEH}/biology-0610/2026/0610_s26_ms_42.pdf`,
  },
  "biology-2026-june-V3": {
    qp: `${BEH}/biology-0610/2026/0610_s26_qp_43.pdf`,
    ms: `${BEH}/biology-0610/2026/0610_s26_ms_43.pdf`,
  },
  "chemistry-2026-feb-V2": {
    qp: `${BEH}/chemistry-0620/2026/0620_m26_qp_42.pdf`,
    ms: `${BEH}/chemistry-0620/2026/0620_m26_ms_42.pdf`,
  },
  "chemistry-2026-june-V1": {
    qp: `${BEH}/chemistry-0620/2026/0620_s26_qp_41.pdf`,
    ms: `${BEH}/chemistry-0620/2026/0620_s26_ms_41.pdf`,
  },
  "chemistry-2026-june-V2": {
    qp: `${BEH}/chemistry-0620/2026/0620_s26_qp_42.pdf`,
    ms: `${BEH}/chemistry-0620/2026/0620_s26_ms_42.pdf`,
  },
  "chemistry-2026-june-V3": {
    qp: `${BEH}/chemistry-0620/2026/0620_s26_qp_43.pdf`,
    ms: `${BEH}/chemistry-0620/2026/0620_s26_ms_43.pdf`,
  },
};

function defaultUrl(
  subject: SubjectId,
  year: number,
  session: SessionId,
  variant: string,
  kind: "qp" | "ms",
): string {
  const code = getSubject(subject).code;
  const yy = String(year).slice(-2);
  const v = variant.replace(/^V/i, "");

  return `https://dynamicpapers.com/wp-content/uploads/2015/09/${code}_${SESSION_CODE[session]}${yy}_${kind}_4${v}.pdf`;
}

export function getPaperLinks(
  subject: SubjectId,
  year: number,
  session: SessionId,
  variant: string,
): { qp: string | null; ms: string | null } {
  const key = `${subject}-${year}-${session}-${variant}`;
  const override = OVERRIDES[key] ?? {};

  return {
    qp:
      override.qp === null
        ? null
        : (override.qp ?? defaultUrl(subject, year, session, variant, "qp")),
    ms:
      override.ms === null
        ? null
        : (override.ms ?? defaultUrl(subject, year, session, variant, "ms")),
  };
}
