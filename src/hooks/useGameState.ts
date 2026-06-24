import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultState, localStorageAdapter } from "@/lib/storage";
import { initiallyUnlockedIds, sprunkies } from "@/lib/sprunkies";
import type { GameState, Sprunki } from "@/types";

const XP_PER_LEVEL = 100;
const XP_PER_CORRECT = 10;

function hydrate(state: GameState): GameState {
  // Make sure starter Sprunkies have progress entries.
  const progress = { ...state.sprunkiProgress };
  for (const id of initiallyUnlockedIds) {
    if (!progress[id]) {
      progress[id] = { unlockedAt: state.lastPlayedAt ?? new Date().toISOString(), problemsSolved: 0, timesSelected: 0 };
    }
  }
  return { ...state, sprunkiProgress: progress };
}

export interface AnswerResult {
  correct: boolean;
  leveledUp: boolean;
  newLevel: number;
  unlocked?: Sprunki;
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => hydrate(localStorageAdapter.load()));
  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    localStorageAdapter.save(state);
  }, [state]);

  // Track play-time only while tab is visible.
  useEffect(() => {
    sessionStartRef.current = Date.now();
    const flush = () => {
      const now = Date.now();
      const delta = now - sessionStartRef.current;
      sessionStartRef.current = now;
      if (delta > 0 && delta < 1000 * 60 * 30) {
        setState((s) => ({ ...s, playTimeMs: s.playTimeMs + delta, lastPlayedAt: new Date().toISOString() }));
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else sessionStartRef.current = Date.now();
    };
    const interval = window.setInterval(flush, 15000);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, []);

  const unlockedSprunkies = useMemo(
    () => sprunkies.filter((s) => state.sprunkiProgress[s.id]?.unlockedAt),
    [state.sprunkiProgress],
  );

  const lockedSprunkies = useMemo(
    () => sprunkies.filter((s) => !state.sprunkiProgress[s.id]?.unlockedAt),
    [state.sprunkiProgress],
  );

  const recordAnswer = useCallback(
    (correct: boolean, sprunkiId: number): AnswerResult => {
      let result: AnswerResult = { correct, leveledUp: false, newLevel: state.level };
      setState((prev) => {
        const totalAnswered = prev.totalAnswered + 1;
        if (!correct) {
          return { ...prev, totalAnswered, streak: 0 };
        }
        const xp = prev.xp + XP_PER_CORRECT;
        const newLevel = Math.floor(xp / XP_PER_LEVEL) + 1;
        const leveledUp = newLevel > prev.level;
        const streak = prev.streak + 1;
        const bestStreak = Math.max(prev.bestStreak, streak);
        const sprunkiProgress = { ...prev.sprunkiProgress };
        const cur = sprunkiProgress[sprunkiId] ?? { problemsSolved: 0, timesSelected: 0 };
        sprunkiProgress[sprunkiId] = {
          ...cur,
          unlockedAt: cur.unlockedAt ?? new Date().toISOString(),
          problemsSolved: cur.problemsSolved + 1,
          timesSelected: cur.timesSelected + 1,
        };

        // Unlock next locked Sprunki every level-up.
        let unlocked: Sprunki | undefined;
        if (leveledUp) {
          const next = sprunkies.find((s) => !sprunkiProgress[s.id]?.unlockedAt);
          if (next) {
            sprunkiProgress[next.id] = {
              unlockedAt: new Date().toISOString(),
              problemsSolved: 0,
              timesSelected: 0,
            };
            unlocked = next;
          }
        }

        result = { correct, leveledUp, newLevel, unlocked };

        return {
          ...prev,
          xp,
          level: newLevel,
          streak,
          bestStreak,
          totalAnswered,
          totalCorrect: prev.totalCorrect + 1,
          sprunkiProgress,
          lastPlayedAt: new Date().toISOString(),
        };
      });
      return result;
    },
    [state.level],
  );

  const markSelected = useCallback((sprunkiId: number) => {
    setState((prev) => {
      const sprunkiProgress = { ...prev.sprunkiProgress };
      const cur = sprunkiProgress[sprunkiId];
      if (!cur) return prev;
      sprunkiProgress[sprunkiId] = { ...cur, timesSelected: cur.timesSelected + 1 };
      return { ...prev, sprunkiProgress };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<GameState["settings"]>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const resetProgress = useCallback(() => {
    localStorageAdapter.clear();
    setState(hydrate(defaultState));
  }, []);

  return {
    state,
    unlockedSprunkies,
    lockedSprunkies,
    recordAnswer,
    markSelected,
    updateSettings,
    resetProgress,
    XP_PER_LEVEL,
  };
}

export type UseGameState = ReturnType<typeof useGameState>;
