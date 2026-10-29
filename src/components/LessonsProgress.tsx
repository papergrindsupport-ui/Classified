import { useMemo, useState } from "react";
import { ChevronDown, ExternalLink, Settings2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { TrackSettingsModal } from "@/components/TrackSettingsModal";
import { cn } from "@/lib/utils";
import { playRewardOnce } from "@/lib/sounds";
import { trackSettingsStore, type LessonRow } from "@/lib/state";
import { useSubject } from "@/lib/subjectContext";
import { TrackerPdfButton } from "./TrackerPdfButton";

export function LessonsProgress() {
  const { LESSON_GROUPS, lessonDoneStore, trackUiStore, solvePath } = useSubject();
  const ui = trackUiStore.useStore((s) => s);
  const showParts = trackSettingsStore.useStore((s) => s.showParts);
  const counts = lessonDoneStore.useStore((s) => s);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const open = useMemo(() => new Set(ui.openKeys), [ui.openKeys]);
  const toggleKey = (key: string) =>
    trackUiStore.set((s) => {
      const set = new Set(s.openKeys);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      return { openKeys: [...set] };
    });

  const valueOf = (row: LessonRow) =>
    (showParts ? counts.done[row.key] : counts.doneQ[row.key]) ?? 0;
  const totalOf = (row: LessonRow) => (showParts ? row.totalParts : row.totalQuestions);

  const allTopics = useMemo(() => LESSON_GROUPS.flatMap((g) => g.topics), [LESSON_GROUPS]);
  const topicsTotal = allTopics.length;
  const topicComplete = (rows: LessonRow[]) =>
    rows.length > 0 &&
    rows.some((r) => totalOf(r) > 0) &&
    rows.every((r) => totalOf(r) === 0 || valueOf(r) >= totalOf(r));
  const topicsCompleted = allTopics.filter((t) => topicComplete(t.rows)).length;

  const trackedRows = allTopics.flatMap((t) => t.rows).filter((r) => totalOf(r) > 0);
  const lessonsTotal = trackedRows.length;
  const lessonsCompleted = trackedRows.filter((r) => valueOf(r) >= totalOf(r)).length;
  const sumDone = trackedRows.reduce((a, r) => a + Math.min(valueOf(r), totalOf(r)), 0);
  const sumTotal = trackedRows.reduce((a, r) => a + totalOf(r), 0);
  const pct = sumTotal > 0 ? Math.round((sumDone / sumTotal) * 100) : 0;

  const topicPct = (rows: LessonRow[]) => {
    const done = rows.reduce(
      (a, r) => a + (totalOf(r) > 0 ? Math.min(valueOf(r), totalOf(r)) : 0),
      0,
    );
    const total = rows.reduce((a, r) => a + totalOf(r), 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  return (
    <section>
      <Collapsible open={ui.lessonsOpen} onOpenChange={(v) => trackUiStore.set({ lessonsOpen: v })}>
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-expanded={ui.lessonsOpen}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    ui.lessonsOpen && "rotate-180",
                  )}
                />
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight">
                    Topics &amp; lessons
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {topicsCompleted}/{topicsTotal} topics completed
                    {showParts ? " · counted in parts" : " · counted in questions"}
                  </p>
                </div>
              </button>
            </CollapsibleTrigger>
            <TrackerPdfButton section="lessons" />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Tracking display settings"
              title="Tracking display settings"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="size-4.5" />
            </Button>
          </div>

          <CollapsibleContent>
            <div className="space-y-5 border-t px-5 py-5">
              {/* Overall progress */}
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-display text-2xl font-bold">{pct}%</span>
                  <span className="text-sm text-muted-foreground">
                    {topicsCompleted}/{topicsTotal} topics completed · {lessonsCompleted}/
                    {lessonsTotal} lessons completed
                  </span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Megatopic -> topic -> lesson collapsibles */}
              {LESSON_GROUPS.map((group) => {
                const megaKey = `mega:${group.mega}`;
                const megaOpen = open.has(megaKey);
                return (
                  <div key={group.mega}>
                    <button
                      type="button"
                      aria-expanded={megaOpen}
                      onClick={() => toggleKey(megaKey)}
                      className="flex w-full items-center gap-2 rounded-lg px-1 py-2 text-left hover:text-primary"
                    >
                      <ChevronDown
                        className={cn(
                          "size-3.5 text-muted-foreground transition-transform",
                          megaOpen && "rotate-180",
                        )}
                      />
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                        {group.mega}
                      </span>
                      <span className="ml-auto text-[11px] text-muted-foreground">
                        {group.topics.filter((t) => topicComplete(t.rows)).length}/
                        {group.topics.length} topics
                      </span>
                    </button>
                    {megaOpen && (
                      <div className="space-y-2 pb-2 pl-4">
                        {group.topics.map((t) => {
                          const topicKey = `topic:${t.topic}`;
                          const isOpen = open.has(topicKey);
                          const complete = topicComplete(t.rows);
                          const doneLessons = t.rows.filter(
                            (r) => totalOf(r) > 0 && valueOf(r) >= totalOf(r),
                          ).length;
                          const topicQuestions = t.rows.reduce((a, r) => a + r.totalQuestions, 0);
                          return (
                            <div key={t.topic} className="rounded-xl border">
                              <div className="flex items-center gap-1 pr-2">
                                <button
                                  type="button"
                                  aria-expanded={isOpen}
                                  onClick={() => toggleKey(topicKey)}
                                  className="flex flex-1 items-center gap-3 px-3 py-2.5 text-left"
                                >
                                  <ChevronDown
                                    className={cn(
                                      "size-3.5 shrink-0 text-muted-foreground transition-transform",
                                      isOpen && "rotate-180",
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      "flex-1 truncate text-sm font-semibold",
                                      complete && "text-primary",
                                    )}
                                  >
                                    {t.topic}
                                    <span className="text-muted-foreground">
                                      {" "}
                                      ({topicQuestions})
                                    </span>
                                  </span>
                                  <div className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-muted sm:w-32">
                                    <div
                                      className="h-full rounded-full bg-primary transition-all"
                                      style={{ width: `${topicPct(t.rows)}%` }}
                                    />
                                  </div>
                                  <span className="w-10 shrink-0 text-right text-[11px] text-muted-foreground">
                                    {doneLessons}/{t.rows.length}
                                  </span>
                                </button>
                                <Link
                                  to={solvePath}
                                  search={{ topic: t.topic }}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                                  aria-label={`Solve questions for ${t.topic}`}
                                  title={`Solve questions for ${t.topic}`}
                                >
                                  <ExternalLink className="size-3.5" />
                                </Link>
                              </div>
                              {isOpen && (
                                <div className="divide-y divide-border/60 border-t">
                                  {t.rows.map((row) => (
                                    <LessonRowInput
                                      key={row.key}
                                      row={row}
                                      showParts={showParts}
                                      counts={counts}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <TrackSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </section>
  );
}

function LessonRowInput({
  row,
  showParts,
  counts,
}: {
  row: LessonRow;
  showParts: boolean;
  counts: { done: Record<string, number>; doneQ: Record<string, number> };
}) {
  const { lessonDoneStore, solvePath } = useSubject();
  const total = showParts ? row.totalParts : row.totalQuestions;
  const value = Math.min((showParts ? counts.done[row.key] : counts.doneQ[row.key]) ?? 0, total);
  const complete = total > 0 && value >= total;
  const unit = showParts ? "parts" : "questions";

  const setDone = (n: number) =>
    lessonDoneStore.set((s) => {
      const next = Math.max(0, Math.min(total, Math.floor(n) || 0));
      const map = showParts ? { ...s.done } : { ...s.doneQ };
      map[row.key] = next;
      return showParts ? { done: map } : { doneQ: map };
    });

  return (
    <div className="flex items-center gap-2 py-1.5 pl-3 pr-2">
      <span className="flex-1 truncate text-sm" title={row.lesson}>
        {row.lesson}
      </span>
      <Link
        to={solvePath}
        search={{ lesson: row.lesson }}
        target="_blank"
        rel="noreferrer"
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        aria-label={`Solve questions for ${row.lesson}`}
        title={`Solve questions for ${row.lesson}`}
      >
        <ExternalLink className="size-3.5" />
      </Link>
      <span
        className="whitespace-nowrap text-[11px] text-muted-foreground"
        title={
          showParts
            ? `${row.totalParts} parts across ${row.totalQuestions} questions`
            : `${row.totalQuestions} questions`
        }
      >
        {showParts
          ? `${row.totalParts} parts · ${row.totalQuestions} questions`
          : `${row.totalQuestions} questions`}
      </span>
      <Input
        type="number"
        min={0}
        max={total}
        inputMode="numeric"
        value={value}
        onChange={(e) => setDone(Number.parseInt(e.target.value, 10) || 0)}
        className="h-7 w-14 px-1 text-center text-sm"
        aria-label={`${unit} done for ${row.lesson}`}
      />
      <Checkbox
        checked={complete}
        onCheckedChange={(v) => {
          // First lesson ticked off this visit gets the celebration sound.
          if (v && !complete) playRewardOnce("track.first-lesson");
          setDone(v ? total : 0);
        }}
        aria-label={
          complete
            ? `${row.lesson} completed — click to reset`
            : `Mark ${row.lesson} completed (all ${total} ${unit})`
        }
      />
    </div>
  );
}
