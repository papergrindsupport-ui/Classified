import { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  EyeOff,
  FileQuestion,
  Minus,
  Settings2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BigCheckbox } from "@/components/BigCheckbox";
import { TrackSettingsModal } from "@/components/TrackSettingsModal";
import type { QuestionCardData } from "@/components/QuestionModal";
import { cn, fmtPart } from "@/lib/utils";
import { cardTopicsLessons } from "@/lib/cardTopics";
import { cardSettingsStore } from "@/lib/prefs";
import { questionState } from "@/lib/state";
import { useSubject } from "@/lib/subjectContext";
import { playMarkDoneReward, playSound } from "@/lib/sounds";
import { QuestionTimer } from "./QuestionTimer";

/**
 * Play mode: one large question card at a time with prev/next chevrons and a
 * collapsible strip of circles for jumping straight to any card.
 */
export function PlayMode({
  cards,
  checkedSet,
}: {
  cards: QuestionCardData[];
  checkedSet: Set<string>;
}) {
  const [index, setIndex] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const safeIndex = Math.min(index, Math.max(0, cards.length - 1));
  const card = cards[safeIndex];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (!cards.length) return;
      e.preventDefault();
      playSound("click");
      const d = e.key === "ArrowLeft" ? -1 : 1;
      setIndex((i) => (Math.min(i, cards.length - 1) + d + cards.length) % cards.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cards.length]);
  if (!card) return null;

  const go = (delta: number) => {
    playSound("click");
    setIndex((safeIndex + delta + cards.length) % cards.length);
  };

  return (
    <div className="mt-6 flex flex-col items-center">
      <div className="flex w-full items-center gap-2 sm:gap-4">
        <Button
          variant="outline"
          size="icon"
          className="size-12 shrink-0 rounded-full"
          aria-label="Previous question"
          title="Previous question"
          onClick={() => go(-1)}
        >
          <ChevronLeft className="size-6" />
        </Button>

        <PlayCard card={card} checkedSet={checkedSet} />

        <Button
          variant="outline"
          size="icon"
          className="size-12 shrink-0 rounded-full"
          aria-label="Next question"
          title="Next question"
          onClick={() => go(1)}
        >
          <ChevronRight className="size-6" />
        </Button>
      </div>

      <div className="mt-5 flex w-full flex-col items-center gap-2">
        {navOpen ? (
          <>
            <div className="no-scrollbar flex w-full justify-start gap-1.5 overflow-x-auto px-2 py-1">
              {cards.map((c, i) => (
                <button
                  key={`${c.paper.key}|${c.question.q}`}
                  type="button"
                  aria-label={`Go to Q${c.question.q} (${c.paper.label})`}
                  aria-current={i === safeIndex}
                  onClick={() => {
                    playSound("click");
                    setIndex(i);
                  }}
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                    i === safeIndex
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:border-primary",
                  )}
                >
                  {c.question.q}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full"
              aria-label="Hide card navigation"
              title="Hide card navigation"
              onClick={() => {
                playSound("click");
                setNavOpen(false);
              }}
            >
              <ChevronDown className="size-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-full"
            aria-label="Show card navigation"
            title="Show card navigation"
            onClick={() => {
              playSound("click");
              setNavOpen(true);
            }}
          >
            <ChevronUp className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function PlayCard({ card, checkedSet }: { card: QuestionCardData; checkedSet: Set<string> }) {
  const S = useSubject();
  const { filtersStore, setQuestionChecked, TOPIC_BY_NAME, getPaperLinks } = S;
  const filters = filtersStore.useStore((s) => s);
  const hideUnmatched = cardSettingsStore.useStore((s) => s.hideUnmatched);
  const [showInfo, setShowInfo] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { paper, question } = card;
  const links = getPaperLinks(paper.year, paper.session, paper.variant);
  const state = questionState([...checkedSet], paper.key, question, card.matchedParts);
  const { topics, lessons, qLessonSet } = cardTopicsLessons(card, filters, hideUnmatched, S.topics);

  const keys = card.matchedParts.map((p) => `${paper.key}|${question.q}|${p}`);
  const doneCount = keys.filter((k) => checkedSet.has(k)).length;
  const allDone = doneCount === keys.length;
  const someDone = doneCount > 0 && !allDone;

  const toggleDone = () => {
    const checking = state !== "all";
    const rewarded = checking ? playMarkDoneReward() : false;
    setQuestionChecked(paper.key, question, checking, card.matchedParts, rewarded);
  };

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {paper.label}
          </span>
          <div className="mt-2 flex items-center gap-3">
            <div className="font-display text-7xl font-bold tracking-tight sm:text-8xl">
              <span className="mr-3 align-baseline text-5xl font-bold text-muted-foreground/60 sm:text-6xl">
                Q
              </span>
              <span className="text-primary">{question.q}</span>
            </div>
            {allDone ? (
              <Check className="size-8 shrink-0 text-primary" strokeWidth={3} />
            ) : someDone ? (
              <Minus className="size-8 shrink-0 text-primary/60" strokeWidth={3} />
            ) : null}
          </div>
          <div
            className={cn(
              "mt-1 font-display text-lg font-semibold",
              card.allMatched ? "text-primary" : "text-muted-foreground",
            )}
          >
            {card.allMatched ? "all parts" : card.partsLabel}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Card settings"
            title="Card settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={showInfo ? "Hide topics and lessons" : "Show topics and lessons"}
            title={showInfo ? "Hide topics and lessons" : "Show topics and lessons"}
            onClick={() => setShowInfo((v) => !v)}
          >
            {showInfo ? (
              <Eye className="size-5 text-primary" />
            ) : (
              <EyeOff className="size-5 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {showInfo && (
        <div className="mt-5 space-y-3 rounded-2xl border bg-muted/20 p-4">
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Topics
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topics.map((t) => {
                const topicLessons = TOPIC_BY_NAME.get(t)?.lessons ?? [];
                const isSelected = topicLessons.some(
                  (l) => qLessonSet.has(l) && filters.lessons.includes(l),
                );
                return (
                  <span
                    key={t}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm",
                      isSelected ? "bg-primary font-medium text-primary-foreground" : "bg-muted",
                    )}
                  >
                    {t}
                  </span>
                );
              })}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Lessons
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lessons.map((l) => {
                const isSelected = filters.lessons.includes(l);
                return (
                  <Link
                    key={l}
                    to={S.solvePath}
                    search={{ lesson: l }}
                    target="_blank"
                    rel="noreferrer"
                    title={`Solve questions for ${l}`}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition-colors hover:border-primary",
                      isSelected
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {l}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 flex gap-3">
        {links.qp ? (
          <Button asChild className="h-14 flex-1 gap-2 rounded-xl text-lg font-semibold">
            <a href={links.qp} target="_blank" rel="noreferrer">
              <ExternalLink className="size-5" />
              Open paper
            </a>
          </Button>
        ) : (
          <Button disabled className="h-14 flex-1 rounded-xl text-lg">
            No paper link
          </Button>
        )}
        {links.ms && (
          <Button
            asChild
            variant="outline"
            className="h-14 gap-2 rounded-xl px-6 text-lg font-semibold"
          >
            <a href={links.ms} target="_blank" rel="noreferrer">
              <FileQuestion className="size-5" />
              Mark scheme
            </a>
          </Button>
        )}
      </div>

      <QuestionTimer card={card} />
      <div className="mt-4 rounded-xl border">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <BigCheckbox
            state={state === "all" ? "on" : state === "some" ? "ind" : "off"}
            onClick={toggleDone}
            label={`Mark question ${question.q} ${state === "all" ? "undone" : "done"}`}
          />
          <button
            type="button"
            className="flex-1 text-left text-base font-medium"
            onClick={toggleDone}
          >
            {state === "all"
              ? card.allMatched
                ? "Done — all parts checked"
                : "Done — all matching parts checked"
              : "Mark question as done"}
          </button>
        </div>
      </div>

      <TrackSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
