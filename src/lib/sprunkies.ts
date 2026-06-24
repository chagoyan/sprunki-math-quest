import data from "@/data/sprunkies.json";
import type { Sprunki } from "@/types";

export const sprunkies: Sprunki[] = (data as Sprunki[])
  .slice()
  .sort((a, b) => a.unlockOrder - b.unlockOrder);

export const getSprunkiById = (id: number) =>
  sprunkies.find((s) => s.id === id);

export const initiallyUnlockedIds = sprunkies
  .filter((s) => s.isUnlocked)
  .map((s) => s.id);

export const totalSprunkies = sprunkies.length;
