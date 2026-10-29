import { beforeEach, describe, expect, it } from "vitest";
import {
  ensureTimer,
  questionTimers,
  randomPartSeconds,
  tickTimers,
  timerAction,
} from "@/lib/question-timer";

describe("question timers", () => {
  beforeEach(() => questionTimers.set({ timers: {} }));
  it("independently adds one or two minutes for each of three matching parts", () => {
    for (let mask = 0; mask < 8; mask++) {
      let part = 0;
      const expected = [0, 1, 2].reduce((sum, bit) => sum + ((mask >> bit) & 1 ? 120 : 60), 0);
      expect(randomPartSeconds(3, () => ((mask >> part++) & 1 ? 0.9 : 0.1))).toBe(expected);
    }
  });
  it("uses only the matching part count and initializes once", () => {
    ensureTimer("question", 1);
    const original = questionTimers.get().timers["question"];
    expect([60, 120]).toContain(original?.duration);
    ensureTimer("question", 9);
    expect(questionTimers.get().timers["question"]).toBe(original);
  });
  it("pauses and resumes without consuming paused time", () => {
    questionTimers.set({
      timers: { q: { duration: 180, remaining: 180, deadline: null, status: "ready" } },
    });
    timerAction("q", "play", 1000);
    timerAction("q", "pause", 31000);
    expect(questionTimers.get().timers["q"]?.remaining).toBe(150);
    tickTimers(90000);
    expect(questionTimers.get().timers["q"]?.remaining).toBe(150);
    timerAction("q", "play", 90000);
    expect(questionTimers.get().timers["q"]?.deadline).toBe(240000);
  });
  it("allows minute adjustments before, during, and after completion", () => {
    questionTimers.set({
      timers: { q: { duration: 60, remaining: 60, deadline: null, status: "ready" } },
    });
    timerAction("q", "plus", 0);
    expect(questionTimers.get().timers["q"]?.remaining).toBe(120);
    timerAction("q", "play", 0);
    timerAction("q", "minus", 0);
    expect(questionTimers.get().timers["q"]?.deadline).toBe(60000);
    expect(tickTimers(60000)).toEqual(["q"]);
    expect(tickTimers(61000)).toEqual([]);
    timerAction("q", "plus", 61000);
    expect(questionTimers.get().timers["q"]?.remaining).toBe(60);
    expect(questionTimers.get().timers["q"]?.status).toBe("ready");
  });
  it("stops and resets to the configured duration", () => {
    questionTimers.set({
      timers: { q: { duration: 120, remaining: 10, deadline: 10000, status: "running" } },
    });
    timerAction("q", "stop", 0);
    expect(questionTimers.get().timers["q"]).toEqual({
      duration: 120,
      remaining: 120,
      deadline: null,
      status: "ready",
    });
  });
});
