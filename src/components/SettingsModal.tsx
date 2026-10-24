import { useState } from "react";
import { Check, ChevronDown, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { SESSIONS, type SessionId } from "@/data/papers";
import { ALL_YEARS, tableStore } from "@/lib/state";

export function SettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const table = tableStore.useStore((s) => s);
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const [yearsOpen, setYearsOpen] = useState(true);

  const toggleSession = (id: SessionId) => {
    const cur = tableStore.get().sessions;
    tableStore.set({
      sessions: cur.includes(id) ? cur.filter((s) => s !== id) : [...cur, id],
    });
  };

  const toggleVariant = (id: SessionId, variant: string) => {
    const variants = { ...tableStore.get().variants };
    const list = variants[id] ?? [];
    variants[id] = list.includes(variant)
      ? list.filter((v) => v !== variant)
      : [...list, variant];
    tableStore.set({ variants });
  };

  const toggleYear = (year: number) => {
    const cur = tableStore.get().years;
    tableStore.set({
      years: cur.includes(year)
        ? cur.filter((y) => y !== year)
        : [...cur, year],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg gap-0 overflow-y-auto p-0">
        <div className="flex items-center gap-3 border-b px-6 py-4">
          <Settings className="size-5 text-primary" />
          <DialogTitle className="text-lg font-bold">
            Planner settings — Biology
          </DialogTitle>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Sessions
            </div>
            <Collapsible open={sessionsOpen} onOpenChange={setSessionsOpen}>
              <div className="rounded-xl border">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
                  >
                    All sessions
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        sessionsOpen && "rotate-180",
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 border-t p-3">
                    {SESSIONS.map((session) => {
                      const sessionOn = table.sessions.includes(session.id);
                      return (
                        <div key={session.id} className="rounded-xl border p-3">
                          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold">
                            <Checkbox
                              checked={sessionOn}
                              onCheckedChange={() => toggleSession(session.id)}
                              aria-label={`Toggle ${session.label}`}
                            />
                            {session.label}
                          </label>
                          <div className="mt-2.5 flex flex-wrap gap-2 pl-7">
                            {session.variants.map((variant) => (
                              <Chip
                                key={variant}
                                active={sessionOn && (table.variants[session.id] ?? []).includes(variant)}
                                onClick={() => toggleVariant(session.id, variant)}
                              >
                                {variant}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Years
            </div>
            <Collapsible open={yearsOpen} onOpenChange={setYearsOpen}>
              <div className="rounded-xl border">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
                  >
                    All {ALL_YEARS.length} years
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        yearsOpen && "rotate-180",
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-wrap gap-2 border-t p-3">
                    {ALL_YEARS.map((year) => (
                      <Chip
                        key={year}
                        active={table.years.includes(year)}
                        onClick={() => toggleYear(year)}
                      >
                        {year}
                      </Chip>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {active && <Check className="size-3.5" strokeWidth={3} />}
      {children}
    </button>
  );
}
