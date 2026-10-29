import { useEffect } from "react";
import { Minus, Pause, Play, Plus, Square, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubject } from "@/lib/subjectContext";
import { cardSettingsStore } from "@/lib/prefs";
import type { QuestionCardData } from "./QuestionModal";
import {
  ensureTimer,
  playTimerAlarm,
  questionTimers,
  stopTimerAlarm,
  tickTimers,
  timerAction,
  unlockTimerAlarm,
} from "@/lib/question-timer";

export function QuestionTimersClock() {
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (tickTimers().length) playTimerAlarm();
    }, 250);
    return () => {
      window.clearInterval(interval);
      stopTimerAlarm();
    };
  }, []);
  return null;
}

export function QuestionTimer({ card }: { card: QuestionCardData }) {
  const hidden = cardSettingsStore.useStore((s) => s.hideTimer);
  if (hidden) return null;
  return <QuestionTimerInner card={card} />;
}

function QuestionTimerInner({ card }: { card: QuestionCardData }) {
  const subject = useSubject();
  const key = `${subject.id}|${card.paper.key}|${card.question.q}|${[...card.matchedParts].sort().join(",")}`;
  const timer = questionTimers.useStore((s) => s.timers[key]);
  useEffect(() => {
    ensureTimer(key, card.matchedParts.length);
  }, [key, card.matchedParts.length]);
  const seconds = timer?.remaining ?? 0;
  const running = timer?.status === "running";
  return (
    <div
      className="mt-3 flex flex-wrap items-center justify-between gap-1 rounded-lg border bg-muted/30 p-2"
      aria-label={`Timer for question ${card.question.q}`}
    >
      <span
        className="min-w-16 text-center font-display text-lg font-semibold tabular-nums text-primary"
        role="timer"
        aria-label="Time remaining"
      >
        {timer ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "—:—"}
      </span>
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Subtract one minute"
          title="Subtract one minute"
          disabled={!timer}
          onClick={() => timerAction(key, "minus")}
        >
          <Minus className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Add one minute"
          title="Add one minute"
          disabled={!timer}
          onClick={() => timerAction(key, "plus")}
        >
          <Plus className="size-4" />
        </Button>
        <Button
          size="icon"
          className="size-8"
          aria-label={
            running ? "Pause timer" : timer?.status === "paused" ? "Resume timer" : "Play timer"
          }
          title={running ? "Pause timer" : "Play timer"}
          disabled={!timer}
          onClick={() => {
            if (!running) {
              stopTimerAlarm();
              unlockTimerAlarm();
            }
            timerAction(key, running ? "pause" : "play");
          }}
        >
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Stop timer"
          title="Stop timer"
          disabled={!timer}
          onClick={() => timerAction(key, "stop")}
        >
          <Square className="size-4" />
        </Button>
        {timer?.status === "finished" && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Silence alarm"
            title="Silence alarm"
            onClick={stopTimerAlarm}
          >
            <VolumeX className="size-4" />
          </Button>
        )}
      </div>
      {timer?.status === "finished" && (
        <span className="w-full text-center text-xs font-medium text-primary" role="status">
          Time’s up
        </span>
      )}
    </div>
  );
}
