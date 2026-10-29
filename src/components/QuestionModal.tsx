import { useState } from "react";
import { ChevronDown, ExternalLink, Eye, EyeOff, FileQuestion, Settings2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BigCheckbox } from "@/components/BigCheckbox";
import { TrackSettingsModal } from "@/components/TrackSettingsModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fmtPart } from "@/lib/utils";
import { cardSettingsStore } from "@/lib/prefs";
import type { ClQuestion, PaperInfo } from "@/data/classification";
import { questionState } from "@/lib/state";
import { useSubject } from "@/lib/subjectContext";
import { QuestionTimer } from "./QuestionTimer";

export type QuestionCardData = {
  paper: PaperInfo;
  question: ClQuestion;
  matchedParts: string[]; // part labels matching the filter
  allMatched: boolean;
  partsLabel: string;
};

export function QuestionModal({
  card,
  open,
  onOpenChange,
}: {
  card: QuestionCardData | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const {
    filtersStore,
    partsStore,
    setPartChecked,
    setQuestionChecked,
    TOPIC_BY_NAME,
    getPaperLinks,
    solvePath,
  } = useSubject();
  const checked = partsStore.useStore((s) => s.checked);
  const filters = filtersStore.useStore((s) => s);
  const [expanded, setExpanded] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hideUnmatched = cardSettingsStore.useStore((s) => s.hideUnmatched);

  if (!card) return null;
  const { paper, question } = card;
  const links = getPaperLinks(paper.year, paper.session, paper.variant);
  // "Done" means every part matching the current lesson filter is checked —
  // parts outside the filter don't count.
  const state = questionState(checked, paper.key, question, card.matchedParts);
  const matched = new Set(card.matchedParts);
  const qLessonSet = new Set(question.parts.flatMap((p) => p.l));

  const allTopics = [...new Set(question.parts.flatMap((p) => p.t))];
  const allLessons = [...new Set(question.parts.flatMap((p) => p.l))];
  // With "hide unmatched" enabled, only topics/lessons touched by the
  // current lesson filter are listed on the card.
  const topics = hideUnmatched
    ? allTopics.filter((t) =>
        (TOPIC_BY_NAME.get(t)?.lessons ?? []).some(
          (l) => qLessonSet.has(l) && filters.lessons.includes(l),
        ),
      )
    : allTopics;
  const lessons = hideUnmatched
    ? allLessons.filter((l) => filters.lessons.includes(l))
    : allLessons;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setExpanded(false);
        setShowInfo(true);
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-lg gap-0 p-0">
        <div className="flex items-start justify-between gap-3 border-b px-6 py-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {paper.label}
            </div>
            <DialogTitle className="font-display text-2xl font-bold">
              Question {question.q}
            </DialogTitle>
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
          <div className="space-y-3 border-b px-6 py-4">
            <div>
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Topics
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topics.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    None match your current filter
                  </span>
                )}
                {topics.map((t) => {
                  const topicLessons = TOPIC_BY_NAME.get(t)?.lessons ?? [];
                  // Colored when the user selected a lesson of this topic that
                  // this question actually touches.
                  const isSelected = topicLessons.some(
                    (l) => qLessonSet.has(l) && filters.lessons.includes(l),
                  );
                  return (
                    <span
                      key={t}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs",
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
                {lessons.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    None match your current filter
                  </span>
                )}
                {lessons.map((l) => {
                  const isSelected = filters.lessons.includes(l);
                  return (
                    <Link
                      key={l}
                      to={solvePath}
                      search={{ lesson: l }}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => onOpenChange(false)}
                      title={`Solve questions for ${l}`}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs transition-colors hover:border-primary",
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

        <div className="space-y-4 px-6 py-5">
          <div className="flex gap-3">
            {links.qp ? (
              <Button asChild className="h-12 flex-1 gap-2 rounded-xl text-base font-semibold">
                <a href={links.qp} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Open paper
                </a>
              </Button>
            ) : (
              <Button disabled className="h-12 flex-1 rounded-xl text-base">
                No paper link
              </Button>
            )}
            {links.ms && (
              <Button
                asChild
                variant="outline"
                className="h-12 gap-2 rounded-xl px-5 text-base font-semibold"
              >
                <a href={links.ms} target="_blank" rel="noreferrer">
                  <FileQuestion className="size-4" />
                  MS
                </a>
              </Button>
            )}
          </div>

          <QuestionTimer card={card} />
          <div className="rounded-xl border">
            <div className="flex items-center gap-3 px-4 py-3">
              <BigCheckbox
                state={state === "all" ? "on" : state === "some" ? "ind" : "off"}
                onClick={() =>
                  setQuestionChecked(paper.key, question, state !== "all", card.matchedParts)
                }
                label={`Mark question ${question.q} ${state === "all" ? "undone" : "done"}`}
              />
              <button
                type="button"
                className="flex-1 text-left text-sm font-medium"
                onClick={() =>
                  setQuestionChecked(paper.key, question, state !== "all", card.matchedParts)
                }
              >
                {state === "all"
                  ? card.allMatched
                    ? "Done — all parts checked"
                    : "Done — all matching parts checked"
                  : "Mark question as done"}
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
              >
                {question.parts.length} parts
                <ChevronDown
                  className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
                />
              </button>
            </div>
            {expanded && (
              <div className="divide-y border-t">
                {question.parts.map((part) => {
                  const on = checked.includes(`${paper.key}|${question.q}|${part.p}`);
                  const isMatched = matched.has(part.p);
                  const togglePart = () => setPartChecked(paper.key, question, part, !on);
                  return (
                    <div
                      key={part.p}
                      role="button"
                      tabIndex={0}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50"
                      onClick={togglePart}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          togglePart();
                        }
                      }}
                    >
                      <BigCheckbox
                        state={on ? "on" : "off"}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePart();
                        }}
                        label={`Mark part ${part.p} ${on ? "undone" : "done"}`}
                      />
                      <span
                        className={cn(
                          "font-display text-lg font-semibold",
                          !isMatched && "text-muted-foreground/60",
                        )}
                      >
                        {fmtPart(part.p)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <TrackSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </DialogContent>
    </Dialog>
  );
}
