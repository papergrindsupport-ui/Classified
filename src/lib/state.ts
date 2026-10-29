import { BIOLOGY_TOPICS, MEGA_GROUPS, MEGAS_OF_TOPIC } from "@/data/megaTopics";
import { PAPERS, getQuestions } from "@/data/classification";
import type { SessionId } from "@/data/papers";
import { createLocalStore } from "./store";
import { createSubject } from "./subject";

export {
  ALL_YEARS,
  ALL_SESSIONS,
  DEFAULT_VARIANTS,
  partKeyOf,
  partMatches,
  questionState,
  type LessonRow,
  type LessonRowKey,
  type PartRow,
  type TriState,
} from "./subject";

// ---------------- Biology (original storage keys) ----------------
export const biology = createSubject({
  id: "biology",
  name: "Biology",
  code: "0610",
  storagePrefix: "bp",
  topics: BIOLOGY_TOPICS,
  megaGroups: MEGA_GROUPS,
  megasOfTopic: MEGAS_OF_TOPIC,
  papers: PAPERS,
  getQuestions,
  solvePath: "/solve",
  trackPath: "/track",
});

export const {
  ALL_LESSONS,
  LESSON_GROUPS,
  TOTAL_PAPERS,
  TOTAL_QUESTIONS,
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
} = biology;

// ---------------- shared across subjects ----------------

export const trackSettingsStore = createLocalStore("bp.trackSettings", {
  showParts: false, // false: questions only; true: questions & parts
});

export const themeStore = createLocalStore("bp.theme", {
  mode: "dark" as "dark" | "light",
  accent: "pink",
});

export function papersDoneCount(done: string[]) {
  return done.length;
}

export type { SessionId };
