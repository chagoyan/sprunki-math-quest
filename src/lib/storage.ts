// Persistence adapter — swap out with Supabase/Firebase later.
import type { GameState } from "@/types";

const KEY = "mathquest:state:v1";

export const defaultState: GameState = {
  xp: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  playTimeMs: 0,
  multiplicationSolved: 0,
  multiplicationChartUnlocked: false,
  divisionSolved: 0,
  sprunkiProgress: {},
  settings: {
    music: true,
    sfx: true,
    voice: true,
    animationSpeed: "normal",
    darkMode: false,
    parentPassword: "1234",
    muted: false,
    operations: ["addition"],
  },
  version: 1,
};

export interface StorageAdapter {
  load(): GameState;
  save(state: GameState): void;
  clear(): void;
}

export const localStorageAdapter: StorageAdapter = {
  load() {
    if (typeof window === "undefined") return defaultState;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return defaultState;
      const parsed = JSON.parse(raw) as Partial<GameState>;
      return {
        ...defaultState,
        ...parsed,
        settings: { ...defaultState.settings, ...(parsed.settings ?? {}) },
        sprunkiProgress: { ...(parsed.sprunkiProgress ?? {}) },
      };
    } catch {
      return defaultState;
    }
  },
  save(state) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(KEY);
  },
};
