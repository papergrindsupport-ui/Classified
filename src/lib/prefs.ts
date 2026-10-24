import { createLocalStore, createSessionStore } from "./store";

/** Settings for the topics & lessons list shown on each question card. */
export const cardSettingsStore = createLocalStore("bp.cardSettings", {
  // Enabled by default: only topics/lessons matching the current filter show.
  hideUnmatched: true,
});

/** Feedback preferences. */
export const feedbackStore = createLocalStore("bp.feedback", {
  sounds: true,
});

/**
 * Solve-page display mode: grid (all cards) or play (one card at a time).
 * Session-only on purpose — every visit starts in grid mode and the choice
 * only lasts until the page is reloaded.
 */
export const viewStore = createSessionStore({
  mode: "grid" as "grid" | "play",
});
