import { useMemo, useState } from "react";
import { Check, ChevronDown, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SettingsModal } from "@/components/SettingsModal";
import { deliverFile } from "@/lib/download";
import { cn } from "@/lib/utils";
import { PAPER_BY_KEY, TOTAL_PAPERS } from "@/data/classification";
import { SESSIONS, SESSION_SHORT, type SessionId } from "@/data/papers";
import {
  ALL_YEARS,
  papersStore,
  partsStore,
  lessonDoneStore,
  tableStore,
  trackUiStore,
} from "@/lib/state";
import { playRewardOnce } from "@/lib/sounds";

export function TrackTable() {
  const done = papersStore.useStore((s) => s.done);
  const table = tableStore.useStore((s) => s);
  const ui = trackUiStore.useStore((s) => s);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const doneSet = useMemo(() => new Set(done), [done]);
  const pct = TOTAL_PAPERS > 0 ? Math.round((done.length / TOTAL_PAPERS) * 100) : 0;

  const years = ALL_YEARS.filter((y) => table.years.includes(y));
  const sessions = SESSIONS.filter((s) => table.sessions.includes(s.id));

  const togglePaper = (key: string) => {
    const cur = papersStore.get().done;
    // First planner cell ticked this visit gets the celebration sound.
    if (!doneSet.has(key)) playRewardOnce("track.first-planner");
    papersStore.set({
      done: doneSet.has(key) ? cur.filter((k) => k !== key) : [...cur, key],
    });
  };

  const download = () => {
    const payload = {
      app: "classified",
      subject: "biology-0610",
      exportedAt: new Date().toISOString(),
      papersDone: papersStore.get().done,
      partsChecked: partsStore.get().checked,
      lessonProgress: lessonDoneStore.get().done,
    };
    deliverFile(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
      "classified-progress.json",
    );
  };

  return (
    <section>
      <Collapsible open={ui.tableOpen} onOpenChange={(v) => trackUiStore.set({ tableOpen: v })}>
        <div className="rounded-2xl border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-expanded={ui.tableOpen}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    ui.tableOpen && "rotate-180",
                  )}
                />
                <div>
                  <div className="font-display text-xl font-bold tracking-tight">
                    {done.length} / {TOTAL_PAPERS} papers completed
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 w-48 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{pct}%</span>
                  </div>
                </div>
              </button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Download progress backup"
                title="Download progress backup"
                onClick={download}
              >
                <Download className="size-4.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Planner settings"
                title="Planner settings"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="size-4.5" />
              </Button>
            </div>
          </div>

          <CollapsibleContent>
            <div className="border-t px-5 py-5">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <th colSpan={2} className="border border-border" />
                      {years.map((y) => (
                        <th
                          key={y}
                          className="border border-border px-2 py-3 text-center font-display font-semibold"
                        >
                          {y}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => {
                      const enabled = (table.variants[session.id] ?? []).filter((v) =>
                        session.variants.includes(v),
                      );
                      return enabled.map((variant, i) => (
                        <tr key={`${session.id}-${variant}`}>
                          {i === 0 && (
                            <td
                              rowSpan={enabled.length}
                              className="border border-border px-4 text-center align-middle font-display font-semibold"
                            >
                              {SESSION_SHORT[session.id]}
                            </td>
                          )}
                          <td className="border border-border px-3 text-center text-xs text-muted-foreground">
                            {variant}
                          </td>
                          {years.map((y) => {
                            const paper = PAPER_BY_KEY.get(`${y}-${session.id}-${variant}`);
                            if (!paper)
                              return (
                                <td
                                  key={`${session.id}-${variant}-${y}`}
                                  className="h-11 border border-border bg-muted/30"
                                />
                              );
                            const isDone = doneSet.has(paper.key);
                            return (
                              <td
                                key={`${session.id}-${variant}-${y}`}
                                className="border border-border p-0.5"
                              >
                                <button
                                  type="button"
                                  onClick={() => togglePaper(paper.key)}
                                  aria-pressed={isDone}
                                  aria-label={`${paper.label} ${isDone ? "completed — click to unmark" : "mark completed"}`}
                                  className={cn(
                                    "grid h-10 w-full place-items-center rounded-sm transition-colors",
                                    isDone
                                      ? "bg-primary text-primary-foreground"
                                      : "hover:bg-muted",
                                  )}
                                >
                                  {isDone && <Check className="size-4" strokeWidth={3} />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ));
                    })}
                    {sessions.length === 0 || years.length === 0 ? (
                      <tr>
                        <td
                          colSpan={2 + years.length}
                          className="border border-border py-8 text-center text-sm text-muted-foreground"
                        >
                          Nothing selected — open planner settings to choose what shows on this
                          table.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </section>
  );
}

// Re-exported for the settings modal so it shares the same table types.
export type { SessionId };
