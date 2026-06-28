import { useState } from "react";
import { BigButton } from "@/components/BigButton";
import { MultiplicationChart } from "@/components/MultiplicationChart";
import type { UseGameState } from "@/hooks/useGameState";
import type { Screen } from "@/components/MathQuestApp";

interface Props {
  game: UseGameState;
  go: (s: Screen) => void;
}

function formatDuration(ms: number) {
  const min = Math.floor(ms / 60000);
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function ParentScreen({ game, go }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);

  const { state, unlockedSprunkies } = game;
  const accuracy = state.totalAnswered
    ? Math.round((state.totalCorrect / state.totalAnswered) * 100)
    : 0;

  if (!unlocked) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <header className="flex items-center justify-between">
          <button
            onClick={() => go("home")}
            className="rounded-full bg-card px-4 py-2 text-sm font-bold ring-1 ring-border shadow-sm hover:bg-accent"
          >
            ← Home
          </button>
          <h2 className="text-2xl font-black">Parent area</h2>
          <div className="w-20" />
        </header>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pwd === state.settings.parentPassword) {
              setUnlocked(true);
              setError(false);
            } else {
              setError(true);
            }
          }}
          className="flex flex-col gap-4 rounded-[2rem] bg-card p-6 shadow-sm ring-1 ring-border/60"
        >
          <p className="text-muted-foreground">Enter the parent passcode to view stats.</p>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="h-14 rounded-2xl bg-accent px-4 text-center text-2xl font-black tracking-[0.4em] outline-none ring-1 ring-border focus:ring-2 focus:ring-[oklch(0.7_0.18_240)]"
            placeholder="••••"
            aria-label="Parent passcode"
          />
          {error && <p className="text-sm font-bold text-[oklch(0.55_0.22_28)]">Wrong passcode. Try again.</p>}
          <BigButton size="lg" type="submit">Unlock</BigButton>
          <p className="text-center text-xs text-muted-foreground">Default passcode: 1234</p>
        </form>
      </div>
    );
  }

  const stats: { label: string; value: string | number; icon: string }[] = [
    { label: "Level", value: state.level, icon: "⭐" },
    { label: "XP", value: state.xp, icon: "✨" },
    { label: "Accuracy", value: `${accuracy}%`, icon: "🎯" },
    { label: "Answered", value: state.totalAnswered, icon: "🧮" },
    { label: "Correct", value: state.totalCorrect, icon: "✅" },
    { label: "Current streak", value: state.streak, icon: "🔥" },
    { label: "Best streak", value: state.bestStreak, icon: "🏆" },
    { label: "Unlocked", value: `${unlockedSprunkies.length}/20`, icon: "🧩" },
    { label: "Play time", value: formatDuration(state.playTimeMs), icon: "⏱" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <button
          onClick={() => go("home")}
          className="rounded-full bg-card px-4 py-2 text-sm font-bold ring-1 ring-border shadow-sm hover:bg-accent"
        >
          ← Home
        </button>
        <h2 className="text-2xl font-black sm:text-3xl">Parent dashboard</h2>
        <div className="w-20" />
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border/60">
            <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
              <span>{s.label}</span>
              <span className="text-xl" aria-hidden>{s.icon}</span>
            </div>
            <div className="mt-1 text-3xl font-black tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[2rem] bg-card p-6 shadow-sm ring-1 ring-border/60">
        <h3 className="text-lg font-black">Notes for parents</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>This first version focuses on addition (0–10).</li>
          <li>Each correct answer awards 10 XP. Every 100 XP unlocks a new friend.</li>
          <li>Progress is saved on this device. Cloud sync can be added later.</li>
          <li>Change the parent passcode and other settings via Settings.</li>
        </ul>
      </div>
    </div>
  );
}
