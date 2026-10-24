import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ExternalLink,
  LayoutGrid,
  MousePointerClick,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { playReward, playSound } from "@/lib/sounds";

const KEY = "bp.tutorial.v1";

const STEPS: { title: string; body: string; Icon: LucideIcon }[] = [
  {
    title: "Welcome to Classified!",
    body: "This is your question picker. First choose the topics and lessons you want questions for — and pick your years (2016–2026). All years are already chosen for you, so you only need to tick what to practise.",
    Icon: BookOpen,
  },
  {
    title: "Unmute your volume",
    body: "Classified plays gentle sounds as you solve — soft clicks, ticks, and a little celebration when you finish a question. Turn your volume up! (You can switch sounds off anytime in the settings.)",
    Icon: Volume2,
  },
  {
    title: "Click a card to solve",
    body: 'You\'ll see big cards, each showing a question number. CLICK a card and the paper opens — scroll to that question number, solve it, then tap "Mark question as done".',
    Icon: MousePointerClick,
  },
  {
    title: "Watch your progress grow",
    body: "The Track page shows everything you've done: how many questions you solved for each topic, how many topics you finished, and how many complete papers you cleared.",
    Icon: BarChart3,
  },
  {
    title: "Jump to any lesson",
    body: "Click a lesson name or the link button on the Track page and a page with that lesson's questions opens in a new tab.",
    Icon: ExternalLink,
  },
  {
    title: "Two ways to play",
    body: "Use the round button at the bottom-right of the screen to switch between grid mode (all cards at once) and play mode (one card at a time). And explore the settings everywhere to make Classified suit you!",
    Icon: LayoutGrid,
  },
];

/** Multi-step first-visit tutorial, shown once (remembered in localStorage). */
export function TutorialModal() {
  const [step, setStep] = useState<number | null>(null); // null = closed / not decided yet

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setStep(0);
    } catch {
      // No storage — don't nag on every visit.
    }
  }, []);

  const finish = () => {
    try {
      window.localStorage.setItem(KEY, "done");
    } catch {
      // ignore
    }
    setStep(null);
    playReward();
    toast.success("You're all set — happy solving!");
  };

  const advance = () => {
    if (step === null) return;
    if (step + 1 >= STEPS.length) {
      finish();
    } else {
      playSound("step");
      setStep(step + 1);
    }
  };

  const skip = () => {
    try {
      window.localStorage.setItem(KEY, "done");
    } catch {
      // ignore
    }
    setStep(null);
  };

  const current = step !== null ? STEPS[step] : undefined;

  return (
    <Dialog open={step !== null} onOpenChange={(v) => (v ? undefined : skip())}>
      <DialogContent className="max-w-md gap-0 p-0 text-center">
        <div className="relative border-b px-6 py-5">
          {step !== null && step > 0 && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous step"
              title="Previous step"
              className="absolute left-2 top-1/2 -translate-y-1/2"
              onClick={() => {
                playSound("step");
                setStep(step - 1);
              }}
            >
              <ChevronLeft className="size-5" />
            </Button>
          )}
          {current && (
            <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-primary/10">
              <current.Icon className="size-7 text-primary" />
            </div>
          )}
          <DialogTitle className="font-display text-2xl font-bold">
            {current?.title ?? ""}
          </DialogTitle>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {step !== null ? `Step ${step + 1} of ${STEPS.length}` : ""}
          </p>
        </div>
        <div className="px-6 py-5">
          <DialogDescription className="text-sm leading-relaxed text-foreground/90">
            {current?.body ?? ""}
          </DialogDescription>
          <div className="mt-3 flex justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={
                  i === step
                    ? "h-1.5 w-6 rounded-full bg-primary"
                    : "h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
                }
              />
            ))}
          </div>
        </div>
        <div className="border-t px-6 py-4">
          <Button
            size="lg"
            className="h-12 w-full rounded-xl text-base font-semibold"
            onClick={advance}
          >
            Ok
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
