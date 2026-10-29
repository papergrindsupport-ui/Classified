import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { trackSettingsStore } from "@/lib/state";
import { cardSettingsStore, feedbackStore } from "@/lib/prefs";
import { playSound } from "@/lib/sounds";
import { useSubject } from "@/lib/subjectContext";

const OPTIONS = [
  {
    value: false,
    title: "Questions only",
    description:
      "Hide parts completely. Each lesson shows a single count of questions solved, capped at the lesson's total questions.",
  },
  {
    value: true,
    title: "Questions & parts",
    description:
      "Show parts too. Counts and inputs include parts, capped at the lesson's total parts, and part labels are written like ai.",
  },
] as const;

export function TrackSettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { name } = useSubject();
  const showParts = trackSettingsStore.useStore((s) => s.showParts);
  const hideUnmatched = cardSettingsStore.useStore((s) => s.hideUnmatched);
  const chemColor = cardSettingsStore.useStore((s) => s.chemColor);
  const hideTimer = cardSettingsStore.useStore((s) => s.hideTimer);
  const sounds = feedbackStore.useStore((s) => s.sounds);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg gap-0 overflow-y-auto p-0">
        <div className="border-b px-6 py-4">
          <DialogTitle className="text-lg font-bold">Settings — {name}</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Tracking, question cards and feedback.
          </p>
        </div>
        <div className="space-y-6 px-6 py-5">
          <section>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Tracking
            </div>
            <div className="space-y-3">
              {OPTIONS.map((opt) => {
                const active = showParts === opt.value;
                return (
                  <button
                    key={opt.title}
                    type="button"
                    aria-pressed={active}
                    onClick={() => trackSettingsStore.set({ showParts: opt.value })}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                      active ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                        active && "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {active && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{opt.title}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {opt.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Question cards
            </div>
            <ToggleRow
              title="Hide unmatched topics & lessons"
              description="On each question card, only show topics and lessons that match your current filter."
              on={hideUnmatched}
              onToggle={() => cardSettingsStore.set({ hideUnmatched: !hideUnmatched })}
            />
            <div className="mt-3 space-y-3">
              <ToggleRow
                title="Hide timer"
                description="Never show the timer controls on questions."
                on={hideTimer}
                onToggle={() => cardSettingsStore.set({ hideTimer: !hideTimer })}
              />
              <ToggleRow
                title="Change color for chemistry pages"
                description="Give Chemistry pages their own color, worked out from your theme color."
                on={chemColor}
                onToggle={() => cardSettingsStore.set({ chemColor: !chemColor })}
              />
            </div>
          </section>

          <section>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Feedback
            </div>
            <ToggleRow
              title="Sound effects"
              description="Play a small sound when you tick questions and parts."
              on={sounds}
              onToggle={() => {
                feedbackStore.set({ sounds: !sounds });
                if (!sounds) playSound("click");
              }}
            />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToggleRow({
  title,
  description,
  on,
  onToggle,
}: {
  title: string;
  description: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
        on ? "border-primary bg-primary/5" : "hover:bg-muted/50",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border",
          on && "border-primary bg-primary text-primary-foreground",
        )}
      >
        {on && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}
