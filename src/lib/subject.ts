import toast from "react-hot-toast";
import type { ClPart, ClQuestion, PaperInfo } from "@/data/classification";
import { SESSIONS, getPaperLinks as getLinks, type SessionId, type SubjectId } from "@/data/papers";
import { playSound } from "./sounds";
import { createLocalStore } from "./store";

export type TopicLessons = { name: string; lessons: string[] };

export type SubjectConfig = {
  id: SubjectId;
  name: string;
  code: string;
  /** localStorage key prefix — biology keeps the original "bp" keys. */
  storagePrefix: string;
  topics: TopicLessons[];
  megaGroups: { mega: string; topics: string[] }[];
  megasOfTopic: Map<string, string[]>;
  papers: PaperInfo[];
  getQuestions: (paperKey: string) => ClQuestion[];
  solvePath: "/solve" | "/solve-chem";
  trackPath: "/track" | "/track-chem";
};

export type LessonRowKey = string; // "topic||lesson"
export type PartRow = { topic: string; lesson: string; key: LessonRowKey };
export type LessonRow = {
  topic: string;
  lesson: string;
  key: LessonRowKey;
  totalParts: number;
  totalQuestions: number;
};
export type TriState = "all" | "some" | "none";

export const ALL_YEARS = Array.from({ length: 2026 - 2016 + 1 }, (_, i) => 2016 + i);
export const ALL_SESSIONS: SessionId[] = SESSIONS.map((s) => s.id);
export const DEFAULT_VARIANTS: Record<SessionId, string[]> = Object.fromEntries(
  SESSIONS.map((s) => [s.id, [...s.variants]]),
) as Record<SessionId, string[]>;

export function partKeyOf(paperKey: string, q: string, part: string) {
  return `${paperKey}|${q}|${part}`;
}

/** A part matches the filter when at least one of its lessons is selected. */
export function partMatches(part: ClPart, selectedLessons: Set<string>) {
  return part.l.some((l) => selectedLessons.has(l));
}

export function questionState(
  checked: string[],
  paperKey: string,
  question: ClQuestion,
  /** Scope the "done" test to these part labels (e.g. the filter-matched parts). */
  parts?: string[],
): TriState {
  const list = parts ?? question.parts.map((p) => p.p);
  let on = 0;
  for (const p of list) if (checked.includes(partKeyOf(paperKey, question.q, p))) on += 1;
  if (on === 0) return "none";
  if (on === list.length) return "all";
  return "some";
}

/**
 * Builds every per-subject store, derived table and tracking action. Each
 * subject keeps its own progress under its own storage prefix.
 */
export function createSubject(cfg: SubjectConfig) {
  const { topics, papers, getQuestions } = cfg;
  const pre = cfg.storagePrefix;

  const topicByName = new Map(topics.map((t) => [t.name, t]));
  const paperByKey = new Map(papers.map((p) => [p.key, p]));

  const allLessons: string[] = (() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of topics)
      for (const l of t.lessons)
        if (!seen.has(l)) {
          seen.add(l);
          out.push(l);
        }
    return out;
  })();

  // ---------------- stores ----------------
  const filtersStore = createLocalStore(`${pre}.filters.v2`, {
    lessons: [] as string[],
    years: ALL_YEARS,
    sessions: ALL_SESSIONS,
    variants: DEFAULT_VARIANTS,
    sort: "desc" as "desc" | "asc",
  });

  function resetFilters() {
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

  const partsStore = createLocalStore(`${pre}.parts`, { checked: [] as string[] });
  const papersStore = createLocalStore(`${pre}.papers`, { done: [] as string[] });
  const lessonDoneStore = createLocalStore(`${pre}.lessonDone`, {
    done: {} as Record<string, number>,
    doneQ: {} as Record<string, number>,
  });
  const trackUiStore = createLocalStore(`${pre}.trackUi`, {
    lessonsOpen: false,
    tableOpen: false,
    openKeys: [] as string[],
  });
  const tableStore = createLocalStore(`${pre}.table`, {
    sessions: ["feb", "june", "oct"] as SessionId[],
    variants: {
      feb: ["V2"],
      june: ["V1", "V2", "V3"],
      oct: ["V1", "V2", "V3"],
    } as Record<SessionId, string[]>,
    years: ALL_YEARS,
  });

  /** Solve-page title: topic numbers of selected lessons, e.g. "T1, T3, T5". */
  function topicNumberTitle(lessons: string[]): string | null {
    const sel = new Set(lessons);
    const nums: number[] = [];
    topics.forEach((t, i) => {
      if (t.lessons.some((l) => sel.has(l))) nums.push(i + 1);
    });
    return nums.length === 0 ? null : `T${nums.join(", T")}`;
  }

  // ---------------- lesson attribution ----------------
  const topicLessonSet = new Map(topics.map((t) => [t.name, new Set(t.lessons)]));
  const partRowsCache = new WeakMap<ClPart, PartRow[]>();

  /**
   * Every (topic, lesson) tracking row a classification part contributes to.
   * A lesson is attributed to topics that contain it and whose megatopic (or
   * the topic itself) is listed in the part's topics; when nothing matches,
   * every topic containing the lesson is used.
   */
  function partRows(part: ClPart): PartRow[] {
    const cached = partRowsCache.get(part);
    if (cached) return cached;
    const rows: PartRow[] = [];
    for (const lesson of part.l) {
      const candidates = topics
        .filter((t) => topicLessonSet.get(t.name)!.has(lesson))
        .map((t) => t.name);
      if (candidates.length === 0) continue;
      let eligible = candidates.filter((topic) => {
        if (part.t.includes(topic)) return true;
        const megas = cfg.megasOfTopic.get(topic) ?? [];
        return megas.some((m) => part.t.includes(m));
      });
      if (eligible.length === 0) eligible = candidates;
      for (const topic of eligible) rows.push({ topic, lesson, key: `${topic}||${lesson}` });
    }
    partRowsCache.set(part, rows);
    return rows;
  }

  const lessonGroups: {
    mega: string;
    topics: { topic: string; rows: LessonRow[] }[];
  }[] = (() => {
    const totals = new Map<LessonRowKey, { parts: number; questions: Set<string> }>();
    for (const paper of papers) {
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
      const t = topicByName.get(topic);
      if (!t) return [];
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
    return cfg.megaGroups.map((g) => ({
      mega: g.mega,
      topics: g.topics.map((topic) => ({ topic, rows: rowsFor(topic) })),
    }));
  })();

  // ---------------- tracking actions ----------------
  function applyRowDeltas(deltasP: Record<string, number>, deltasQ: Record<string, number>) {
    if (Object.keys(deltasP).length === 0 && Object.keys(deltasQ).length === 0) return;
    lessonDoneStore.set((s) => {
      const done = { ...s.done };
      for (const [key, d] of Object.entries(deltasP)) done[key] = Math.max(0, (done[key] ?? 0) + d);
      const doneQ = { ...s.doneQ };
      for (const [key, d] of Object.entries(deltasQ))
        doneQ[key] = Math.max(0, (doneQ[key] ?? 0) + d);
      return { done, doneQ };
    });
  }

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
      const nBefore = parts.filter((p) => beforeSet.has(partKeyOf(paperKey, question.q, p))).length;
      const nAfter = parts.filter((p) => afterSet.has(partKeyOf(paperKey, question.q, p))).length;
      if (nAfter !== nBefore) deltasP[key] = nAfter - nBefore;
      const qBefore = nBefore > 0;
      const qAfter = nAfter > 0;
      if (qAfter !== qBefore) deltasQ[key] = qAfter ? 1 : -1;
    }
    applyRowDeltas(deltasP, deltasQ);
  }

  function setPartChecked(paperKey: string, question: ClQuestion, part: ClPart, checked: boolean) {
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

  function setQuestionChecked(
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
    const keys = new Set(labels.map((p) => partKeyOf(paperKey, question.q, p)));
    const after = checked ? [...new Set([...before, ...keys])] : before.filter((k) => !keys.has(k));
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

  const totalQuestions = papers.reduce((acc, p) => acc + getQuestions(p.key).length, 0);

  return {
    ...cfg,
    TOPIC_BY_NAME: topicByName,
    PAPER_BY_KEY: paperByKey,
    TOTAL_PAPERS: papers.length,
    TOTAL_QUESTIONS: totalQuestions,
    ALL_LESSONS: allLessons,
    LESSON_GROUPS: lessonGroups,
    filtersStore,
    resetFilters,
    partsStore,
    papersStore,
    lessonDoneStore,
    trackUiStore,
    tableStore,
    topicNumberTitle,
    partRows,
    setPartChecked,
    setQuestionChecked,
    getPaperLinks: (year: number, session: SessionId, variant: string) =>
      getLinks(cfg.id, year, session, variant),
  };
}

export type Subject = ReturnType<typeof createSubject>;
