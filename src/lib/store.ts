import { useSyncExternalStore } from "react";

/**
 * Tiny persistent store backed by localStorage.
 * - Absent key -> `initial` (so "not configured yet" == sensible defaults).
 * - `get()` lazily loads once and caches; selectors must return stable
 *   references (values stored in state are only replaced on set()).
 */
export function createLocalStore<T extends object>(key: string, initial: T) {
  const listeners = new Set<() => void>();
  let state: T | null = null;

  function load(): T {
    if (state !== null) return state;
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = parsed && typeof parsed === "object" ? { ...initial, ...parsed } : initial;
      } else {
        state = initial;
      }
    } catch {
      state = initial;
    }
    return state!;
  }

  function set(patch: Partial<T> | ((prev: T) => Partial<T>)) {
    const prev = load();
    const p = typeof patch === "function" ? patch(prev) : patch;
    state = { ...prev, ...p };
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // storage full / unavailable — keep in-memory state
    }
    listeners.forEach((l) => l());
  }

  function subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }

  function useStore<S>(selector: (s: T) => S): S {
    return useSyncExternalStore(
      subscribe,
      () => selector(load()),
      () => selector(initial),
    );
  }

  return { useStore, set, get: load, _key: key };
}

/**
 * Session-only store: same API as createLocalStore but nothing is written to
 * localStorage — state resets to `initial` on every reload/new visit.
 */
export function createSessionStore<T extends object>(initial: T) {
  const listeners = new Set<() => void>();
  let state: T = initial;

  function set(patch: Partial<T> | ((prev: T) => Partial<T>)) {
    const p = typeof patch === "function" ? patch(state) : patch;
    state = { ...state, ...p };
    listeners.forEach((l) => l());
  }

  function subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }

  function useStore<S>(selector: (s: T) => S): S {
    return useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(initial),
    );
  }

  return { useStore, set, get: () => state };
}
