import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, ListFilter, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SESSIONS, SESSION_SHORT, type SessionId } from "@/data/papers";
import { ALL_SESSIONS, ALL_YEARS } from "@/lib/state";
import { useSubject } from "@/lib/subjectContext";

export function TopicChecklist({
  open: controlledOpen,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
} = {}) {
  const { filtersStore, ALL_LESSONS, megaGroups: MEGA_GROUPS, TOPIC_BY_NAME } = useSubject();
  const lessons = filtersStore.useStore((s) => s.lessons);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setUncontrolledOpen(v));
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const selected = useMemo(() => new Set(lessons), [lessons]);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // When opened from outside (e.g. the empty-state button), focus the trigger
  // so the popover's focus-outside dismissal doesn't close it immediately.
  useEffect(() => {
    if (controlledOpen) triggerRef.current?.focus();
  }, [controlledOpen]);

  const setLessons = (next: string[]) => filtersStore.set({ lessons: next });

  const toggleLesson = (lesson: string) => {
    setLessons(selected.has(lesson) ? lessons.filter((l) => l !== lesson) : [...lessons, lesson]);
  };

  const toggleTopic = (topic: string) => {
    const topicLessons = TOPIC_BY_NAME.get(topic)?.lessons ?? [];
    const allSelected = topicLessons.every((l) => selected.has(l));
    if (allSelected) {
      setLessons(lessons.filter((l) => !topicLessons.includes(l)));
    } else {
      const add = topicLessons.filter((l) => !selected.has(l));
      setLessons([...lessons, ...add]);
    }
  };

  const allOff = lessons.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button ref={triggerRef} variant="outline" className="gap-2">
          <ListFilter className="size-4 text-primary" />
          Topics & lessons
          <span className="text-xs text-muted-foreground">
            {allOff ? "none" : `${lessons.length}/${ALL_LESSONS.length}`}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Filter by topic & lesson
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setLessons(ALL_LESSONS)}
            >
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setLessons([])}
            >
              None
            </Button>
          </div>
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-2">
          {MEGA_GROUPS.map((group) => (
            <div key={group.mega} className="mb-2">
              {/* megatopics are labels only, never checkable */}
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                {group.mega}
              </div>
              {group.topics.map((topic) => {
                const topicLessons = TOPIC_BY_NAME.get(topic)?.lessons ?? [];
                const onCount = topicLessons.filter((l) => selected.has(l)).length;
                const topicState =
                  onCount === 0 ? false : onCount === topicLessons.length ? true : "indeterminate";
                const isOpen = expanded.has(topic);
                return (
                  <div key={topic} className="rounded-lg">
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <Checkbox
                        checked={topicState}
                        onCheckedChange={() => toggleTopic(topic)}
                        aria-label={`Toggle all lessons in ${topic}`}
                      />
                      <button
                        type="button"
                        className="flex-1 text-left text-sm font-medium hover:text-primary"
                        onClick={() => toggleTopic(topic)}
                      >
                        {topic}
                      </button>
                      <button
                        type="button"
                        aria-label={isOpen ? `Collapse ${topic}` : `Expand ${topic}`}
                        onClick={() =>
                          setExpanded((prev) => {
                            const next = new Set(prev);
                            if (next.has(topic)) next.delete(topic);
                            else next.add(topic);
                            return next;
                          })
                        }
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <ChevronsUpDown
                          className={cn("size-3.5 transition-transform", isOpen && "rotate-180")}
                        />
                      </button>
                    </div>
                    {isOpen && (
                      <div className="ml-5 border-l pl-3 pb-1">
                        {topicLessons.map((lesson) => (
                          <label
                            key={lesson}
                            className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Checkbox
                              checked={selected.has(lesson)}
                              onCheckedChange={() => toggleLesson(lesson)}
                            />
                            {lesson}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function YearPicker() {
  const { filtersStore } = useSubject();
  const years = filtersStore.useStore((s) => s.years);
  const sessions = filtersStore.useStore((s) => s.sessions);
  const variants = filtersStore.useStore((s) => s.variants);
  const selected = useMemo(() => new Set(years), [years]);
  const selectedSessions = useMemo(() => new Set(sessions), [sessions]);
  const [open, setOpen] = useState(false);
  const all = years.length === ALL_YEARS.length;

  const setYears = (next: number[]) => filtersStore.set({ years: next });
  const setSessions = (next: SessionId[]) => filtersStore.set({ sessions: next });

  const toggleSession = (id: SessionId) =>
    setSessions(selectedSessions.has(id) ? sessions.filter((s) => s !== id) : [...sessions, id]);

  const toggleVariant = (sessionId: SessionId, variant: string) => {
    const list = variants[sessionId] ?? [];
    filtersStore.set({
      variants: {
        ...variants,
        [sessionId]: list.includes(variant)
          ? list.filter((v) => v !== variant)
          : [...list, variant],
      },
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          {all
            ? "All years"
            : years.length === 0
              ? "No years"
              : `${Math.min(...years)}–${Math.max(...years)}`}
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Years
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setYears(ALL_YEARS)}
            >
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setYears([])}
            >
              None
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 p-3">
          {ALL_YEARS.map((year) => (
            <label
              key={year}
              className="flex cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Checkbox
                checked={selected.has(year)}
                onCheckedChange={() =>
                  setYears(selected.has(year) ? years.filter((y) => y !== year) : [...years, year])
                }
              />
              {year}
            </label>
          ))}
        </div>
        <div className="flex items-center justify-between border-t px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sessions
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setSessions(ALL_SESSIONS)}
            >
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setSessions([])}
            >
              None
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 p-3">
          {SESSIONS.map((session) => (
            <label
              key={session.id}
              className="flex cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Checkbox
                checked={selectedSessions.has(session.id)}
                onCheckedChange={() => toggleSession(session.id)}
                aria-label={`Toggle ${session.label}`}
              />
              {SESSION_SHORT[session.id]}
            </label>
          ))}
        </div>
        <div className="border-t px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Variants
        </div>
        <div className="space-y-1 p-3 pt-1">
          {SESSIONS.map((session) => {
            const sessionOn = selectedSessions.has(session.id);
            const checked = variants[session.id] ?? [];
            return (
              <div
                key={session.id}
                className={cn("flex flex-wrap items-center gap-1.5", !sessionOn && "opacity-40")}
              >
                <span className="w-9 text-xs text-muted-foreground">
                  {SESSION_SHORT[session.id]}
                </span>
                {session.variants.map((variant) => (
                  <label
                    key={variant}
                    className={cn(
                      "flex items-center gap-1 rounded px-1.5 py-1 text-sm",
                      sessionOn ? "cursor-pointer hover:bg-muted" : "cursor-not-allowed",
                    )}
                  >
                    <Checkbox
                      disabled={!sessionOn}
                      checked={sessionOn && checked.includes(variant)}
                      onCheckedChange={() => toggleVariant(session.id, variant)}
                      aria-label={`${variant} of ${SESSION_SHORT[session.id]}`}
                    />
                    {variant}
                  </label>
                ))}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ResetFiltersButton() {
  const { resetFilters } = useSubject();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 text-xs text-muted-foreground"
      onClick={() => resetFilters()}
    >
      <RotateCw className="size-3.5" />
    </Button>
  );
}
