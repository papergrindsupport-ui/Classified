import { feedbackStore } from "./prefs";

export type SoundName = "click" | "success" | "undo" | "step";

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  c: AudioContext,
  freq: number,
  start: number,
  dur: number,
  gain = 0.12,
  type: OscillatorType = "sine",
) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** Plays a short UI sound; silently no-ops when muted or unsupported. */
export function playSound(name: SoundName) {
  try {
    if (!feedbackStore.get().sounds) return;
    const c = audioContext();
    if (!c) return;
    switch (name) {
      case "click":
        tone(c, 660, 0, 0.07);
        break;
      case "success":
        tone(c, 523.25, 0, 0.12);
        tone(c, 783.99, 0.1, 0.18);
        break;
      case "undo":
        tone(c, 440, 0, 0.08);
        tone(c, 330, 0.07, 0.12);
        break;
      case "step":
        tone(c, 520, 0, 0.09, 0.1);
        break;
    }
  } catch {
    // Audio is best-effort feedback only.
  }
}

// ---------------- uploaded reward sound ----------------

const REWARD_URL = "/reward.mp3";

let rewardBuffer: AudioBuffer | null = null;
let rewardLoading: Promise<AudioBuffer | null> | null = null;

function loadReward(): Promise<AudioBuffer | null> {
  if (rewardBuffer) return Promise.resolve(rewardBuffer);
  if (!rewardLoading) {
    rewardLoading = (async () => {
      const c = audioContext();
      if (!c) return null;
      const res = await fetch(REWARD_URL);
      if (!res.ok) return null;
      const raw = await res.arrayBuffer();
      rewardBuffer = await c.decodeAudioData(raw);
      return rewardBuffer;
    })().catch(() => null);
  }
  return rewardLoading;
}

/** Plays the uploaded celebration sound; silently no-ops when muted or unsupported. */
export function playReward() {
  try {
    if (!feedbackStore.get().sounds) return;
    const c = audioContext();
    if (!c) return;
    void loadReward().then((buf) => {
      const live = audioContext();
      if (!buf || !live) return;
      const src = live.createBufferSource();
      src.buffer = buf;
      const g = live.createGain();
      g.gain.value = 0.9;
      src.connect(g).connect(live.destination);
      src.start();
    });
  } catch {
    // Audio is best-effort feedback only.
  }
}

const playedOnce = new Set<string>();

/**
 * Plays the reward sound the first time `key` is requested (per page load).
 * Returns true when the reward actually fired this call.
 */
export function playRewardOnce(key: string): boolean {
  if (playedOnce.has(key)) return false;
  playedOnce.add(key);
  playReward();
  return true;
}

let markDoneClicks = 0;

/**
 * Plays the reward sound on the first two "mark question as done" clicks
 * (per page load). Returns true when the reward actually fired this call.
 */
export function playMarkDoneReward(): boolean {
  markDoneClicks += 1;
  if (markDoneClicks > 2) return false;
  playReward();
  return true;
}

/** Test hook: clears the per-page-load reward memory. */
export function resetRewards() {
  playedOnce.clear();
  markDoneClicks = 0;
}
