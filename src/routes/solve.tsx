import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Check,
  ListFilter,
  LayoutGrid,
  Minus,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResetFiltersButton, TopicChecklist, YearPicker } from "@/components/FilterControls";
import { QuestionModal, type QuestionCardData } from "@/components/QuestionModal";
import { PlayMode } from "@/components/PlayMode";
import { PAPERS, getQuestions } from "@/data/classification";
import { BIOLOGY_TOPICS } from "@/data/megaTopics";
import { cn, fmtPart } from "@/lib/utils";
import { playSound } from "@/lib/sounds";
import {
  filtersStore,
  partsStore,
  partMatches,
  topicNumberTitle,
  ALL_YEARS,
  type SessionId,
} from "@/lib/state";
import { viewStore } from "@/lib/prefs";

export const Route = createFileRoute("/solve")({
  validateSearch: (search: Record<string, unknown>) => {
    // ?lesson=<name> deep-links from Track / lesson badges to a single lesson
    // with every year selected. ?topic=<name> does the same for every lesson
    // of that topic. Keys are only present when set, so plain links to /solve
    // stay valid.
    const lesson =
      typeof search["lesson"] === "string" && search["lesson"] ? search["lesson"] : undefined;
    const topic =
      typeof search["topic"] === "string" && search["topic"] ? search["topic"] : undefined;
    return {
      ...(lesson ? { lesson } : {}),
      ...(topic ? { topic } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Solve — Classified IGCSE Biology" },
      {
        name: "description",
        content:
          "Browse Cambridge IGCSE Biology (0610) past-paper questions by topic, lesson and year. Open the paper or mark scheme and tick parts off as you solve.",
      },
      { property: "og:title", content: "Solve — Classified IGCSE Biology" },
      {
        property: "og:description",
        content:
          "Browse Cambridge IGCSE Biology (0610) past-paper questions by topic, lesson and year.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SolvePage,
});

function SolvePage() {
  const filters = filtersStore.useStore((s) => s);
  const checked = partsStore.useStore((s) => s.checked);
  const mode = viewStore.useStore((s) => s.mode);
  const { lesson, topic } = Route.useSearch();
  const [active, setActive] = useState<QuestionCardData | null>(null);
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const navigate = useNavigate({ from: "/solve" });

  // Deep link (e.g. from a link on /track): filter to that lesson — or every
  // lesson of that topic — across all years.
  useEffect(() => {
    if (lesson) {
      filtersStore.set({ lessons: [lesson], years: ALL_YEARS });
    } else if (topic) {
      const t = BIOLOGY_TOPICS.find((x) => x.name === topic);
      if (t) filtersStore.set({ lessons: [...t.lessons], years: ALL_YEARS });
    }
  }, [lesson, topic]);

  // First visit to /solve: point the user at the Track page once.
  useEffect(() => {
    try {
      if (window.localStorage.getItem("bp.solve-track-tip") !== "1") {
        setTipOpen(true);
      }
    } catch {
      // storage unavailable — skip the tip
    }
  }, []);

  const dismissTip = () => {
    try {
      window.localStorage.setItem("bp.solve-track-tip", "1");
    } catch {
      // storage unavailable
    }
    setTipOpen(false);
  };

  const checkedSet = useMemo(() => new Set(checked), [checked]);

  const cards = useMemo<QuestionCardData[]>(() => {
    const selectedLessons = new Set(filters.lessons);
    const yearSet = new Set(filters.years);
    const sessionSet = new Set(filters.sessions);
    const variantSet = new Set(
      Object.entries(filters.variants).flatMap(([ses, vs]) =>
        sessionSet.has(ses as SessionId) ? vs.map((v) => `${ses}-${v}`) : [],
      ),
    );
    const out: QuestionCardData[] = [];
    for (const paper of PAPERS) {
      if (!yearSet.has(paper.year)) continue;
      if (!variantSet.has(`${paper.session}-${paper.variant}`)) continue;
      for (const question of getQuestions(paper.key)) {
        const matched = question.parts.filter((p) => partMatches(p, selectedLessons));
        if (matched.length === 0) continue;
        out.push({
          paper,
          question,
          matchedParts: matched.map((p) => p.p),
          allMatched: matched.length === question.parts.length,
          partsLabel: matched.map((p) => fmtPart(p.p)).join(", "),
        });
      }
    }
    out.sort((a, b) =>
      filters.sort === "desc" ? b.paper.year - a.paper.year : a.paper.year - b.paper.year,
    );
    return out;
  }, [filters]);

  // Title shows the selected topics as numbers, e.g. "T1, T3, T5"; plain
  // "Solve" before any lesson is picked.
  const title = topicNumberTitle(filters.lessons) ?? "Solve";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {cards.length === 0
              ? "Use filters"
              : `${cards.length} question${cards.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TopicChecklist open={pickerOpen} onOpenChange={setPickerOpen} />
          <YearPicker />
          <Button
            variant="outline"
            className="gap-2"
            title={
              filters.sort === "desc"
                ? "Sorted 2026 → 2016. Click for oldest first."
                : "Sorted 2016 → 2026. Click for newest first."
            }
            onClick={() => {
              playSound("click");
              filtersStore.set({ sort: filters.sort === "desc" ? "asc" : "desc" });
            }}
          >
            {filters.sort === "desc" ? (
              <ArrowDownWideNarrow className="size-4 text-primary" />
            ) : (
              <ArrowUpNarrowWide className="size-4 text-primary" />
            )}
          </Button>
          <ResetFiltersButton />
        </div>
      </div>

      {filters.lessons.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-5 rounded-3xl border border-dashed px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Start by selecting topics &amp; lessons
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Choose what you want to practise and matching past-paper questions will appear here.
          </p>
          <Button
            size="lg"
            className="h-14 gap-2 rounded-xl px-8 text-lg font-semibold"
            onClick={() => setPickerOpen(true)}
          >
            <ListFilter className="size-5" />
            Choose topics &amp; lessons
          </Button>
        </div>
      ) : cards.length === 0 ? (
        <div className="mt-20 text-center text-sm text-muted-foreground">
          No questions match your filters. Try selecting more topics, lessons, years, sessions or
          variants.
        </div>
      ) : mode === "play" ? (
        <PlayMode cards={cards} checkedSet={checkedSet} />
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <QuestionCard
              key={`${card.paper.key}|${card.question.q}`}
              card={card}
              checkedSet={checkedSet}
              onOpen={() => {
                setActive(card);
                setOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Round mode toggle, stuck to the bottom-right of the page */}
      <button
        type="button"
        onClick={() => {
          playSound("click");
          viewStore.set({ mode: mode === "grid" ? "play" : "grid" });
        }}
        aria-label={mode === "grid" ? "Switch to play mode" : "Switch to grid mode"}
        title={
          mode === "grid"
            ? "Switch to play mode (one card at a time)"
            : "Switch to grid mode (all cards at once)"
        }
        className="fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full border bg-card text-primary shadow-lg transition-colors hover:border-primary/60"
      >
        {mode === "grid" ? <Play className="size-5" /> : <LayoutGrid className="size-5" />}
      </button>

      <QuestionModal card={active} open={open} onOpenChange={setOpen} />

      {/* One-time nudge towards the Track page */}
      <Dialog open={tipOpen} onOpenChange={(v) => (v ? setTipOpen(true) : dismissTip())}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Sorry, one more thing
            </DialogTitle>
            <DialogDescription>
              You can also try the Track page and go to classified questions from there — just tap
              the link icon next to any topic or lesson.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={dismissTip}>
              Maybe later
            </Button>
            <Button
              onClick={() => {
                dismissTip();
                navigate({ to: "/track" });
              }}
            >
              Go to tracker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuestionCard({
  card,
  checkedSet,
  onOpen,
}: {
  card: QuestionCardData;
  checkedSet: Set<string>;
  onOpen: () => void;
}) {
  const keys = card.matchedParts.map((p) => `${card.paper.key}|${card.question.q}|${p}`);
  const doneCount = keys.filter((k) => checkedSet.has(k)).length;
  const allDone = doneCount === keys.length;
  const someDone = doneCount > 0 && !allDone;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/60"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-foreground">
          {card.paper.label}
        </span>
        {allDone ? (
          <Check className="size-4 shrink-0 text-primary" strokeWidth={3} />
        ) : someDone ? (
          <Minus className="size-4 shrink-0 text-primary/60" strokeWidth={3} />
        ) : null}
      </div>
      <div className="mt-3 font-display text-5xl font-bold tracking-tight">
        {/* Muted "Q" label, gently accented question number — keeps the
            focus on the number instead of a bright letter. */}
        <span className="mr-2 align-baseline text-4xl font-bold text-muted-foreground/60">Q</span>
        <span className="text-primary">{card.question.q}</span>
      </div>
      <div
        className={cn(
          "mt-1.5 font-display text-lg font-semibold",
          card.allMatched ? "text-primary" : "text-muted-foreground",
        )}
      >
        {card.allMatched ? "all parts" : card.partsLabel}
      </div>
    </button>
  );
}
