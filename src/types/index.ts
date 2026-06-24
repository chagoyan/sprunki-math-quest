export type Operation = "addition" | "subtraction" | "multiplication" | "division";
export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Sprunki {
  id: number;
  name: string;
  color: string;
  icon: string;
  voice: string;
  personality: string;
  role: string;
  favoriteOperation: Operation;
  unlockOrder: number;
  rarity: Rarity;
  isUnlocked: boolean;
  timesSelected: number;
  catchPhrases: string[];
}

export interface SprunkiProgress {
  unlockedAt?: string; // ISO date
  problemsSolved: number;
  timesSelected: number;
}

export interface Settings {
  music: boolean;
  sfx: boolean;
  voice: boolean;
  animationSpeed: "slow" | "normal" | "fast";
  darkMode: boolean;
  parentPassword: string;
  muted: boolean;
}

export interface GameState {
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  totalCorrect: number;
  totalAnswered: number;
  playTimeMs: number;
  sprunkiProgress: Record<number, SprunkiProgress>;
  settings: Settings;
  lastPlayedAt?: string;
  version: number;
}

export interface Problem {
  a: number;
  b: number;
  operation: Operation;
  answer: number;
  choices: number[];
}
