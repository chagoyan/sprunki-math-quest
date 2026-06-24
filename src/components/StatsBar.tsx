import { motion } from "framer-motion";
import type { GameState } from "@/types";

interface Props {
  state: GameState;
  xpPerLevel: number;
}

export function StatsBar({ state, xpPerLevel }: Props) {
  const xpIntoLevel = state.xp % xpPerLevel;
  const pct = (xpIntoLevel / xpPerLevel) * 100;
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <Stat label="Level" value={state.level} icon="⭐" tone="amber" />
      <Stat label="Streak" value={state.streak} icon="🔥" tone="rose" />
      <div className="col-span-3 rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border/60 sm:col-span-1">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-bold text-muted-foreground">XP</span>
          <span className="font-mono font-bold">{xpIntoLevel}/{xpPerLevel}</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[oklch(0.78_0.18_140)] to-[oklch(0.72_0.2_200)]"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, tone }: { label: string; value: number; icon: string; tone: "amber" | "rose" }) {
  const bg = tone === "amber"
    ? "from-[oklch(0.92_0.13_85)] to-[oklch(0.86_0.16_60)]"
    : "from-[oklch(0.93_0.08_20)] to-[oklch(0.85_0.14_15)]";
  return (
    <div className={`rounded-3xl bg-gradient-to-br ${bg} p-4 shadow-sm ring-1 ring-border/40`}>
      <div className="flex items-center justify-between text-sm font-bold text-slate-700">
        <span>{label}</span>
        <span className="text-xl" aria-hidden>{icon}</span>
      </div>
      <div className="mt-1 text-3xl font-black tabular-nums text-slate-900">{value}</div>
    </div>
  );
}
