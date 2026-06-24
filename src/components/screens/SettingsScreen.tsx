import { useState } from "react";
import { BigButton } from "@/components/BigButton";
import type { UseGameState } from "@/hooks/useGameState";
import type { Screen } from "@/components/MathQuestApp";

interface Props {
  game: UseGameState;
  go: (s: Screen) => void;
}

export function SettingsScreen({ game, go }: Props) {
  const { state, updateSettings, resetProgress } = game;
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <button
          onClick={() => go("home")}
          className="rounded-full bg-card px-4 py-2 text-sm font-bold ring-1 ring-border shadow-sm hover:bg-accent"
        >
          ← Home
        </button>
        <h2 className="text-2xl font-black sm:text-3xl">Settings</h2>
        <div className="w-20" aria-hidden />
      </header>

      <div className="flex flex-col gap-3 rounded-[2rem] bg-card p-4 shadow-sm ring-1 ring-border/60 sm:p-6">
        <Toggle label="Music" hint="Background music" checked={state.settings.music} onChange={(v) => updateSettings({ music: v })} />
        <Toggle label="Sound effects" hint="Cheers, taps, level-ups" checked={state.settings.sfx} onChange={(v) => updateSettings({ sfx: v })} />
        <Toggle label="Voice" hint="Sprunki voice lines" checked={state.settings.voice} onChange={(v) => updateSettings({ voice: v })} />
        <Toggle label="Dark mode" hint="Coming soon" checked={state.settings.darkMode} onChange={(v) => updateSettings({ darkMode: v })} disabled />
        <div className="rounded-2xl bg-accent/60 p-4">
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Animation speed</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["slow", "normal", "fast"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => updateSettings({ animationSpeed: opt })}
                className={`rounded-2xl px-3 py-2 text-sm font-black capitalize ring-1 ring-border transition-all ${
                  state.settings.animationSpeed === opt
                    ? "bg-foreground text-background"
                    : "bg-card hover:bg-accent"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-card p-4 shadow-sm ring-1 ring-border/60 sm:p-6">
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Danger zone</p>
        {!confirmReset ? (
          <div className="mt-3">
            <BigButton variant="danger" size="md" onClick={() => setConfirmReset(true)}>
              Reset progress
            </BigButton>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-sm font-bold">Are you sure? This clears XP, level and unlocks.</p>
            <BigButton variant="danger" size="md" onClick={() => { resetProgress(); setConfirmReset(false); }}>
              Yes, reset
            </BigButton>
            <BigButton variant="ghost" size="md" onClick={() => setConfirmReset(false)}>
              Cancel
            </BigButton>
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex cursor-pointer items-center justify-between rounded-2xl bg-accent/60 p-4 ${disabled ? "opacity-60" : ""}`}>
      <div>
        <p className="text-lg font-black">{label}</p>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-9 w-16 rounded-full transition-colors ${
          checked ? "bg-gradient-to-r from-[oklch(0.78_0.18_140)] to-[oklch(0.72_0.2_200)]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all ${checked ? "left-8" : "left-1"}`}
        />
      </button>
    </label>
  );
}
