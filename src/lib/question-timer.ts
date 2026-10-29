import { createSessionStore } from "./store";
import { feedbackStore } from "./prefs";

const ALARM_URL = "/alarmsound.mp3";

export type TimerState = {
  duration: number;
  remaining: number;
  deadline: number | null;
  status: "ready" | "running" | "paused" | "finished";
};
export const questionTimers = createSessionStore({ timers: {} as Record<string, TimerState> });
let alarm: HTMLAudioElement | undefined;

export function randomPartSeconds(parts: number, random: () => number = Math.random) {
  return Array.from({ length: parts }, () => (random() < 0.5 ? 1 : 2) * 60).reduce(
    (sum, n) => sum + n,
    0,
  );
}
export function ensureTimer(key: string, parts: number) {
  if (questionTimers.get().timers[key]) return;
  const duration = randomPartSeconds(parts);
  saveTimer(key, { duration, remaining: duration, deadline: null, status: "ready" });
}
function saveTimer(key: string, timer: TimerState) {
  questionTimers.set((s) => ({ timers: { ...s.timers, [key]: timer } }));
}
export function remainingAt(timer: TimerState, now: number) {
  return timer.deadline === null
    ? timer.remaining
    : Math.max(0, Math.ceil((timer.deadline - now) / 1000));
}
export function timerAction(
  key: string,
  action: "play" | "pause" | "stop" | "plus" | "minus",
  now = Date.now(),
) {
  const timer = questionTimers.get().timers[key];
  if (!timer) return;
  const remaining = remainingAt(timer, now);
  if (action === "play") {
    const seconds = remaining || timer.duration;
    saveTimer(key, {
      ...timer,
      remaining: seconds,
      deadline: now + seconds * 1000,
      status: "running",
    });
  } else if (action === "pause") {
    saveTimer(key, { ...timer, remaining, deadline: null, status: "paused" });
  } else if (action === "stop") {
    stopTimerAlarm();
    saveTimer(key, { ...timer, remaining: timer.duration, deadline: null, status: "ready" });
  } else {
    const delta = action === "plus" ? 60 : -60;
    const next = Math.max(0, remaining + delta);
    const running = timer.status === "running";
    saveTimer(key, {
      ...timer,
      duration: Math.max(60, timer.duration + delta),
      remaining: next,
      deadline: running ? now + next * 1000 : null,
      status: running
        ? "running"
        : next > 0
          ? timer.status === "paused"
            ? "paused"
            : "ready"
          : "finished",
    });
  }
}
export function tickTimers(now = Date.now()) {
  const timers = questionTimers.get().timers;
  const finished: string[] = [];
  let changed = false;
  const next = { ...timers };
  for (const [key, timer] of Object.entries(timers)) {
    if (timer.status !== "running") continue;
    const remaining = remainingAt(timer, now);
    if (remaining !== timer.remaining) changed = true;
    if (remaining === 0) {
      next[key] = { ...timer, remaining: 0, deadline: null, status: "finished" };
      finished.push(key);
      changed = true;
    } else next[key] = { ...timer, remaining };
  }
  if (changed) questionTimers.set({ timers: next });
  return finished;
}
export function unlockTimerAlarm() {
  if (!alarm) {
    alarm = new Audio(ALARM_URL);
    alarm.volume = 0.2;
    alarm.preload = "auto";
  }
  const audio = alarm;
  audio.muted = true;
  void audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    })
    .catch(() => {
      audio.muted = false;
    });
}
export function playTimerAlarm() {
  if (!feedbackStore.get().sounds) return;
  if (!alarm) {
    alarm = new Audio(ALARM_URL);
    alarm.volume = 0.2;
  }
  alarm.muted = false;
  alarm.currentTime = 0;
  void alarm.play().catch(() => {});
}
export function stopTimerAlarm() {
  if (alarm) {
    alarm.pause();
    alarm.currentTime = 0;
  }
}
