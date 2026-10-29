import { BIOLOGY_TOPICS } from "@/data/megaTopics";
import type { TopicLessons } from "@/lib/subject";
import type { QuestionCardData } from "@/components/QuestionModal";

/**
 * Topics & lessons listed on a question card (modal or play-mode card).
 *
 * Topics are derived from the question's lessons: a topic is listed when any
 * of its lessons belong to the question (the lessons shown follow the
 * "hide unmatched" setting, and the topics follow them). Topics named in the
 * parts that aren't in the topic catalogue are always kept so nothing is lost.
 */
export function cardTopicsLessons(
  card: QuestionCardData,
  filters: { lessons: string[] },
  hideUnmatched: boolean,
  catalogue: TopicLessons[] = BIOLOGY_TOPICS,
): {
  topics: string[];
  lessons: string[];
  qLessonSet: Set<string>;
} {
  const qLessonSet = new Set(card.question.parts.flatMap((p) => p.l));
  const allTopics = [...new Set(card.question.parts.flatMap((p) => p.t))];
  const allLessons = [...new Set(card.question.parts.flatMap((p) => p.l))];

  const lessons = hideUnmatched
    ? allLessons.filter((l) => filters.lessons.includes(l))
    : allLessons;
  const lessonSet = new Set(lessons);

  // Topics whose lesson list includes one of the shown lessons, in catalogue
  // order — these are "the topics the question's lessons are from".
  const derived = catalogue
    .filter((t) => t.lessons.some((l) => lessonSet.has(l)))
    .map((t) => t.name);
  const derivedSet = new Set(derived);
  // Part-named topics not in the catalogue can't be matched against the
  // filter, so keep them regardless of the setting.
  const known = new Set(catalogue.map((t) => t.name));
  const extras = allTopics.filter((t) => !known.has(t) && !derivedSet.has(t));

  const topics = hideUnmatched
    ? [...new Set([...derived, ...extras])]
    : [...new Set([...derived, ...allTopics, ...extras])];

  return { topics, lessons, qLessonSet };
}
