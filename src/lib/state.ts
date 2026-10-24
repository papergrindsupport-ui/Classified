import { BIOLOGY_TOPICS, MEGA_GROUPS, MEGAS_OF_TOPIC } from "@/data/megaTopics";
import {
  getQuestions,
  PAPERS,
  TOTAL_PAPERS,
  type ClPart,
  type ClQuestion,
} from "@/data/classification";
import { SESSIONS, SUBJECTS, type SessionId } from "@/data/papers";
import toast from "react-hot-toast";
import { playSound } from "./sounds";
import { createLocalStore } from "./store";

export const ALL_YEARS = SUBJECTS[0]!.years;

export const ALL_SESSIONS: SessionId[] = SESSIONS.map((s) => s.id);
export const DEFAULT_VARIANTS: Record<SessionId, string[]> = Object.fromEntries(
  SESSIONS.map((s) => [s.id, [...s.variants]]),
) as Record<SessionId, string[]>;

export const ALL_LESSONS: string[] = (() => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of BIOLOGY_TOPICS)
    for (const l of t.lessons)
      if (!seen.has(l)) {
        seen.add(l);
        out.push(l);
      }
  return out;
})();

// ---------------- stores (all persisted to localStorage) ----------------

export const filtersStore = createLocalStore("bp.filters.v2", {
  lessons: [] as string[], // default: nothing selected — user picks topics first
  years: ALL_YEARS,
  sessions: ALL_SESSIONS, // default: every session shown
  variants: DEFAULT_VARIANTS, // default: every variant shown
  sort: "desc" as "desc" | "asc", // question order by year — newest first
});

/** Solve-page title: topic numbers of selected lessons, e.g. "T1, T3, T5". */
export function topicNumberTitle(lessons: string[]): string | null {
  const sel = new Set(lessons);
  const nums: number[] = [];
  BIOLOGY_TOPICS.forEach((t, i) => {
    if (t.lessons.some((l) => sel.has(l))) nums.push(i + 1);
  });
  return nums.length === 0 ? null : `T${nums.join(", T")}`;
}

export function resetFilters() {
  filtersStore.set({
    lessons: [],
    years: ALL_YEARS,
    sessions: ALL_SESSIONS,
    variants: DEFAULT_VARIANTS,
    sort: "desc",
  });
  playSound("click");
  toast("Filters reset");
}

export const partsStore = createLocalStore("bp.parts", {
  checked: [] as string[], // "paperKey|question|part"
});

export const papersStore = createLocalStore("bp.papers", {
  done: [] as string[], // paperKey
});

export const lessonDoneStore = createLocalStore("bp.lessonDone", {
  done: {} as Record<string, number>, // parts done per "topic||lesson"
  doneQ: {} as Record<string, number>, // questions done (≥1 part checked) per row
});

export const trackSettingsStore = createLocalStore("bp.trackSettings", {
  showParts: false, // false: questions only; true: questions & parts
});

export const trackUiStore = createLocalStore("bp.trackUi", {
  lessonsOpen: false, // Topics & lessons section expanded
  tableOpen: false, // planner table section expanded
  openKeys: [] as string[], // expanded megatopic/topic keys ("mega:X" / "topic:X")
});

export const tableStore = createLocalStore("bp.table", {
  sessions: ["feb", "june", "oct"] as SessionId[],
  variants: {
    feb: ["V2"],
    june: ["V1", "V2", "V3"],
    oct: ["V1", "V2", "V3"],
  } as Record<SessionId, string[]>,
  years: ALL_YEARS,
});

export const themeStore = createLocalStore("bp.theme", {
  mode: "dark" as "dark" | "light",
  accent: "pink",
});

// ---------------- lesson attribution ----------------

export type LessonRowKey = string; // "topic||lesson"

const topicLessonSet = new Map(
  BIOLOGY_TOPICS.map((t) => [t.name, new Set(t.lessons)]),
);

export type PartRow = { topic: string; lesson: string; key: LessonRowKey };

const partRowsCache = new WeakMap<ClPart, PartRow[]>();

/**
 * Every (topic, lesson) tracking row a classification part contributes to.
 * A lesson is attributed to topics that contain it and whose megatopic (or the
 * topic itself) is listed in the part's largeTopics; when nothing matches,
 * every topic containing the lesson is used.
 */
export function partRows(part: ClPart): PartRow[] {
  const cached = partRowsCache.get(part);
  if (cached) return cached;
  const rows: PartRow[] = [];
  for (const lesson of part.l) {
    const candidates = BIOLOGY_TOPICS.filter((t) =>
      topicLessonSet.get(t.name)!.has(lesson),
    ).map((t) => t.name);
    if (candidates.length === 0) continue;
    let eligible = candidates.filter((topic) => {
      if (part.t.includes(topic)) return true;
      const megas = MEGAS_OF_TOPIC.get(topic) ?? [];
      return megas.some((m) => part.t.includes(m));
    });
    if (eligible.length === 0) eligible = candidates;
    for (const topic of eligible)
      rows.push({ topic, lesson, key: `${topic}||${lesson}` });
  }
  partRowsCache.set(part, rows);
  return rows;
}

export type LessonRow = {
  topic: string;
  lesson: string;
  key: LessonRowKey;
  totalParts: number;
  totalQuestions: number;
};

// Display grouping: megatopic -> topic -> lesson rows (topics deduped to their
// primary megatopic via MEGA_GROUPS).
export const LESSON_GROUPS: {
  mega: string;
  topics: { topic: string; rows: LessonRow[] }[];
}[] = (() => {
  const totals = new Map<LessonRowKey, { parts: number; questions: Set<string> }>();
  for (const paper of PAPERS) {
    for (const q of getQuestions(paper.key)) {
      for (const part of q.parts) {
        for (const row of partRows(part)) {
          const t = totals.get(row.key) ?? { parts: 0, questions: new Set<string>() };
          t.parts += 1;
          t.questions.add(`${paper.key}|${q.q}`);
          totals.set(row.key, t);
        }
      }
    }
  }

  const rowsFor = (topic: string): LessonRow[] => {
    const t = BIOLOGY_TOPICS.find((x) => x.name === topic)!;
    return t.lessons.map((lesson) => {
      const key = `${topic}||${lesson}`;
      const tot = totals.get(key);
      return {
        topic,
        lesson,
        key,
        totalParts: tot?.parts ?? 0,
        totalQuestions: tot?.questions.size ?? 0,
      };
    });
  };

  return MEGA_GROUPS.map((g) => ({
    mega: g.mega,
    topics: g.topics.map((topic) => ({ topic, rows: rowsFor(topic) })),
  }));
})();

// ---------------- tracking actions ----------------

export function partKeyOf(paperKey: string, q: string, part: string) {
  return `${paperKey}|${q}|${part}`;
}

export type TriState = "all" | "some" | "none";

export function questionState(
  checked: string[],
  paperKey: string,
  question: ClQuestion,
  /** Scope the "done" test to these part labels (e.g. the filter-matched parts). */
  parts?: string[],
): TriState {
  const list = parts ?? question.parts.map((p) => p.p);
  let on = 0;
  for (const p of list)
    if (checked.includes(partKeyOf(paperKey, question.q, p))) on += 1;
  if (on === 0) return "none";
  if (on === list.length) return "all";
  return "some";
}

function applyRowDeltas(
  deltasP: Record<string, number>,
  deltasQ: Record<string, number>,
) {
  if (Object.keys(deltasP).length === 0 && Object.keys(deltasQ).length === 0)
    return;
  lessonDoneStore.set((s) => {
    const done = { ...s.done };
    for (const [key, d] of Object.entries(deltasP))
      done[key] = Math.max(0, (done[key] ?? 0) + d);
    const doneQ = { ...s.doneQ };
    for (const [key, d] of Object.entries(deltasQ))
      doneQ[key] = Math.max(0, (doneQ[key] ?? 0) + d);
    return { done, doneQ };
  });
}

/**
 * Recomputes parts-done and questions-done deltas for every lesson row the
 * question touches, comparing the checked keys before vs after the change.
 * A question counts once for a row as soon as any of its row-attributed parts
 * is checked.
 */
function applyQuestionDeltas(
  paperKey: string,
  question: ClQuestion,
  before: string[],
  after: string[],
) {
  const rowParts = new Map<LessonRowKey, string[]>();
  for (const part of question.parts)
    for (const row of partRows(part)) {
      const list = rowParts.get(row.key) ?? [];
      list.push(part.p);
      rowParts.set(row.key, list);
    }
  const beforeSet = new Set(before);
  const afterSet = new Set(after);
  const deltasP: Record<string, number> = {};
  const deltasQ: Record<string, number> = {};
  for (const [key, parts] of rowParts) {
    const nBefore = parts.filter((p) =>
      beforeSet.has(partKeyOf(paperKey, question.q, p)),
    ).length;
    const nAfter = parts.filter((p) =>
      afterSet.has(partKeyOf(paperKey, question.q, p)),
    ).length;
    if (nAfter !== nBefore) deltasP[key] = nAfter - nBefore;
    const qBefore = nBefore > 0;
    const qAfter = nAfter > 0;
    if (qAfter !== qBefore) deltasQ[key] = qAfter ? 1 : -1;
  }
  applyRowDeltas(deltasP, deltasQ);
}

export function setPartChecked(
  paperKey: string,
  question: ClQuestion,
  part: ClPart,
  checked: boolean,
) {
  const before = partsStore.get().checked;
  const key = partKeyOf(paperKey, question.q, part.p);
  const after =
    before.includes(key) === checked
      ? before
      : checked
        ? [...before, key]
        : before.filter((k) => k !== key);
  if (after === before) return;
  partsStore.set({ checked: after });
  applyQuestionDeltas(paperKey, question, before, after);

  const beforeState = questionState(before, paperKey, question);
  const afterState = questionState(after, paperKey, question);
  if (afterState === "all" && beforeState !== "all") {
    playSound("success");
    toast.success(`Question ${question.q} done!`);
  } else {
    playSound(checked ? "click" : "undo");
  }
}

export function setQuestionChecked(
  paperKey: string,
  question: ClQuestion,
  checked: boolean,
  /** Only check/uncheck these part labels (defaults to every part). */
  parts?: string[],
  /** Skip the built-in tick sound (e.g. when a special sound already played). */
  skipSound?: boolean,
) {
  const before = partsStore.get().checked;
  const labels = parts ?? question.parts.map((p) => p.p);
  const keys = new Set(
    labels.map((p) => partKeyOf(paperKey, question.q, p)),
  );
  const after = checked
    ? [...new Set([...before, ...keys])]
    : before.filter((k) => !keys.has(k));
  if (after.length === before.length) return;
  partsStore.set({ checked: after });
  applyQuestionDeltas(paperKey, question, before, after);

  const beforeState = questionState(before, paperKey, question);
  const afterState = questionState(after, paperKey, question);
  if (checked && afterState === "all" && beforeState !== "all") {
    if (!skipSound) playSound("success");
    toast.success(`Question ${question.q} done!`);
  } else {
    if (!skipSound) playSound(checked ? "click" : "undo");
    if (!checked && beforeState === "all" && afterState !== "all")
      toast(`Question ${question.q} unmarked`);
  }
}

// ---------------- filtering ----------------

/** A part matches the filter when at least one of its lessons is selected. */
export function partMatches(part: ClPart, selectedLessons: Set<string>) {
  return part.l.some((l) => selectedLessons.has(l));
}

export function papersDoneCount(done: string[]) {
  return done.length;
}

export const TOTAL_QUESTIONS = PAPERS.reduce(
  (acc, p) => acc + getQuestions(p.key).length,
  0,
);

export { TOTAL_PAPERS };
export type { SessionId };
