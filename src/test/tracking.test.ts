import { beforeEach, describe, expect, it } from "vitest";

describe("lesson tracking sync (localStorage stores)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("increments lesson progress when a question is checked, and back to 0 when unchecked", async () => {
    const state = await import("@/lib/state");
    const data = await import("@/data/classification");

    const paperKey = "2016-feb-V2";
    const question = data.getQuestions(paperKey)[0]!;
    expect(question).toBeDefined();

    state.setQuestionChecked(paperKey, question, true);
    const after = state.lessonDoneStore.get().done;
    const keys = new Set(
      question.parts.flatMap((p) => state.partRows(p).map((r) => r.key)),
    );
    expect(keys.size).toBeGreaterThan(0);
    for (const key of keys) expect(after[key] ?? 0).toBeGreaterThan(0);

    state.setQuestionChecked(paperKey, question, false);
    const reset = state.lessonDoneStore.get().done;
    for (const key of keys) expect(reset[key] ?? 0).toBe(0);
  });

  it("auto-checks a lesson as complete when checked parts reach the total questions", async () => {
    const state = await import("@/lib/state");
    const row = state.LESSON_GROUPS.flatMap((g) => g.topics)
      .flatMap((t) => t.rows)
      .find((r) => r.totalQuestions > 0)!;

    state.lessonDoneStore.set((s) => ({
      doneQ: { ...s.doneQ, [row.key]: row.totalQuestions },
    }));
    const doneQ = state.lessonDoneStore.get().doneQ;
    expect(doneQ[row.key] ?? -1).toBe(row.totalQuestions);
    expect((doneQ[row.key] ?? 0) >= row.totalQuestions).toBe(true);
  });

  it("counts a question once per lesson row in doneQ when any of its parts is checked", async () => {
    const state = await import("@/lib/state");
    const data = await import("@/data/classification");

    const paperKey = "2016-feb-V2";
    const question = data.getQuestions(paperKey)[0]!;
    const firstRows = [
      ...new Set(state.partRows(question.parts[0]!).map((r) => r.key)),
    ];
    expect(firstRows.length).toBeGreaterThan(0);

    // Check only the first part: parts count 1, questions count 1 per its row.
    state.setPartChecked(paperKey, question, question.parts[0]!, true);
    let done = state.lessonDoneStore.get();
    for (const key of firstRows) {
      expect(done.done[key] ?? 0).toBe(1);
      expect(done.doneQ[key] ?? 0).toBe(1);
    }

    // Checking the rest of the question must not add more questions per row.
    state.setQuestionChecked(paperKey, question, true);
    done = state.lessonDoneStore.get();
    for (const key of firstRows) expect(done.doneQ[key] ?? 0).toBe(1);

    state.setQuestionChecked(paperKey, question, false);
    done = state.lessonDoneStore.get();
    for (const key of firstRows) {
      expect(done.done[key] ?? 0).toBe(0);
      expect(done.doneQ[key] ?? 0).toBe(0);
    }
  });

  it("treats a question as done only when all filter-matching parts are checked", async () => {
    const state = await import("@/lib/state");
    const data = await import("@/data/classification");

    const paperKey = "2016-feb-V2";
    const question = data.getQuestions(paperKey)[0]!;
    expect(question.parts.length).toBeGreaterThan(1);
    const matched = question.parts.slice(0, 1).map((p) => p.p);

    // Marking done with only the matching parts in scope checks just those.
    state.setQuestionChecked(paperKey, question, true, matched);
    expect(
      state.questionState(state.partsStore.get().checked, paperKey, question, matched),
    ).toBe("all");
    const others = question.parts.slice(1).map((p) => p.p);
    expect(
      others.some((p) =>
        state.partsStore
          .get()
          .checked.includes(state.partKeyOf(paperKey, question.q, p)),
      ),
    ).toBe(false);

    // Unchecking the matching parts leaves non-matching parts untouched.
    state.setQuestionChecked(paperKey, question, false, matched);
    expect(
      state.questionState(state.partsStore.get().checked, paperKey, question, matched),
    ).toBe("none");
  });

  it("defaults filters to no lessons selected and every year", async () => {
    localStorage.clear();
    const state = await import("@/lib/state");
    const filters = state.filtersStore.get();
    expect(filters.years).toEqual(state.ALL_YEARS);
    expect(filters.lessons).toEqual([]);
  });

  it("formats part labels without brackets", async () => {
    const { fmtPart } = await import("@/lib/utils");
    expect(fmtPart("a")).toBe("a");
    expect(fmtPart("ai")).toBe("ai");
    expect(fmtPart("aii")).toBe("aii");
    expect(fmtPart("aiv")).toBe("aiv");
    expect(fmtPart("biii")).toBe("biii");
  });

  it("numbers the solve-page title by selected topics", async () => {
    localStorage.clear();
    const state = await import("@/lib/state");
    expect(state.topicNumberTitle([])).toBe(null);
    expect(state.topicNumberTitle(["Characteristics of Living Organisms"])).toBe("T1");
    expect(
      state.topicNumberTitle([
        "Characteristics of Living Organisms",
        "Enzymes",
      ]),
    ).toBe("T1, T5");
  });

  it("defaults filters to all sessions, all variants and descending sort", async () => {
    localStorage.clear();
    const state = await import("@/lib/state");
    const f = state.filtersStore.get();
    expect(f.sessions).toEqual(state.ALL_SESSIONS);
    expect(f.variants).toEqual(state.DEFAULT_VARIANTS);
    expect(f.sort).toBe("desc");
  });

  it("defaults card settings to hide unmatched topics/lessons and sounds on", async () => {
    localStorage.clear();
    const { cardSettingsStore, feedbackStore } = await import("@/lib/prefs");
    expect(cardSettingsStore.get().hideUnmatched).toBe(true);
    expect(feedbackStore.get().sounds).toBe(true);
  });
});
