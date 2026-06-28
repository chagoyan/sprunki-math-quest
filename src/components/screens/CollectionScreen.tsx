import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SprunkiAvatar } from "@/components/SprunkiAvatar";
import { BigButton } from "@/components/BigButton";
import { sprunkies } from "@/lib/sprunkies";
import { MultiplicationChart } from "@/components/MultiplicationChart";
import { mixer } from "@/lib/sprunkiMixer";
import { music } from "@/lib/music";
import type { UseGameState } from "@/hooks/useGameState";
import type { Sprunki } from "@/types";
import type { Screen } from "@/components/MathQuestApp";

interface Props {
  game: UseGameState;
  go: (s: Screen) => void;
}

const rarityRing: Record<string, string> = {
  common: "ring-slate-200",
  rare: "ring-sky-300",
  epic: "ring-fuchsia-300",
  legendary: "ring-amber-300",
};

const rarityBadge: Record<string, string> = {
  common: "bg-slate-100 text-slate-700",
  rare: "bg-sky-100 text-sky-800",
  epic: "bg-fuchsia-100 text-fuchsia-800",
  legendary: "bg-amber-100 text-amber-800",
};

export function CollectionScreen({ game, go }: Props) {
  const [open, setOpen] = useState<Sprunki | null>(null);
  const [chartOpen, setChartOpen] = useState(false);
  const [activeIds, setActiveIds] = useState<Set<number>>(new Set());
  const chartUnlocked = game.state.multiplicationChartUnlocked;
  const multSolved = game.state.multiplicationSolved;

  // Pause background music while the mixer is the main audio stage.
  useEffect(() => {
    music.stop();
    return () => {
      mixer.reset();
    };
  }, []);

  useEffect(() => mixer.subscribe(setActiveIds), []);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <button
          onClick={() => go("home")}
          className="rounded-full bg-card px-4 py-2 text-sm font-bold ring-1 ring-border shadow-sm hover:bg-accent"
        >
          ← Home
        </button>
        <h2 className="text-2xl font-black sm:text-3xl">Jam Room</h2>
        <button
          onClick={() => mixer.reset()}
          disabled={activeIds.size === 0}
          className="rounded-full bg-rose-500 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ⟲ Reset
        </button>
      </header>

      <div className="flex justify-center">
        <button
          onClick={() => chartUnlocked && setChartOpen(true)}
          disabled={!chartUnlocked}
          className={`rounded-full px-4 py-2 text-sm font-black ring-1 shadow-sm transition ${
            chartUnlocked
              ? "bg-gradient-to-r from-amber-400 to-rose-400 text-white ring-amber-500 hover:scale-105"
              : "bg-muted text-muted-foreground ring-border cursor-not-allowed"
          }`}
          aria-label="Multiplication chart"
        >
          {chartUnlocked
            ? "✨ Multiplication chart"
            : `🔒 Multiplication chart — solve ${Math.max(0, 100 - multSolved)} more`}
        </button>
      </div>

      <p className="text-center text-sm font-bold text-muted-foreground">
        {game.unlockedSprunkies.length} / {sprunkies.length} collected · Tap a Sprunki to loop · Tap again to stop
        {activeIds.size > 0 && <> · <span className="text-emerald-600">{activeIds.size} jamming</span></>}
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {sprunkies.map((s) => {
          const prog = game.state.sprunkiProgress[s.id];
          const unlocked = !!prog?.unlockedAt;
          const playing = activeIds.has(s.id);
          return (
            <motion.div
              key={s.id}
              whileHover={{ y: -4 }}
              className={`relative flex flex-col items-center gap-3 rounded-3xl bg-card p-4 shadow-sm ring-2 transition-all ${
                playing ? "ring-emerald-400 ring-4 shadow-lg" : rarityRing[s.rarity]
              }`}
            >
              <motion.button
                onClick={() => {
                  if (!unlocked) return;
                  mixer.toggle(s.id, s.icon);
                }}
                whileTap={{ scale: 0.95 }}
                animate={playing ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={playing ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }}
                className="flex flex-col items-center gap-3"
                aria-label={unlocked ? `${playing ? "Stop" : "Play"} ${s.name}` : "Locked Sprunki"}
              >
                <SprunkiAvatar sprunki={s} size={96} locked={!unlocked} idle={unlocked} />
                <div className="text-center">
                  <p className="text-base font-black leading-tight">
                    {unlocked ? s.name : "???"}
                  </p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${rarityBadge[s.rarity]}`}>
                    {s.rarity}
                  </span>
                </div>
              </motion.button>
              {unlocked && (
                <button
                  onClick={() => setOpen(s)}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-muted text-xs font-black text-muted-foreground hover:bg-accent"
                  aria-label={`${s.name} info`}
                >
                  i
                </button>
              )}
              {playing && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white shadow">
                  ♪ Loop
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {activeIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="sticky bottom-4 z-40 mx-auto w-full max-w-3xl rounded-3xl bg-card/95 p-3 shadow-2xl ring-2 ring-emerald-400 backdrop-blur"
          >
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700">
                ♪ Performance Pads — tap to stab
              </p>
              <span className="text-[10px] font-bold text-muted-foreground">
                {activeIds.size} active
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sprunkies
                .filter((s) => activeIds.has(s.id))
                .map((s) => (
                  <motion.button
                    key={s.id}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ y: -2 }}
                    onClick={() => mixer.accent(s.icon)}
                    className="flex flex-col items-center gap-1 rounded-2xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200 active:bg-emerald-200"
                    aria-label={`Play ${s.name} accent`}
                  >
                    <SprunkiAvatar sprunki={s} size={48} idle />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {s.name}
                    </span>
                  </motion.button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>




      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[2rem] bg-card p-6 shadow-2xl ring-1 ring-border sm:p-8"
            >
              {(() => {
                const prog = game.state.sprunkiProgress[open.id];
                const unlocked = !!prog?.unlockedAt;
                return (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <SprunkiAvatar sprunki={open} size={160} locked={!unlocked} idle={unlocked} bouncing={unlocked} />
                    <div>
                      <h3 className="text-3xl font-black">{unlocked ? open.name : "Locked"}</h3>
                      <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${rarityBadge[open.rarity]}`}>
                        {open.rarity}
                      </span>
                    </div>
                    {unlocked ? (
                      <dl className="grid w-full grid-cols-2 gap-3 text-left text-sm">
                        <Info label="Personality" value={open.personality} />
                        <Info label="Voice" value={open.voice.replace(/_/g, " ")} />
                        <Info label="Favorite" value={open.favoriteOperation} />
                        <Info label="Role" value={open.role} />
                        <Info label="Solved" value={`${prog?.problemsSolved ?? 0}`} />
                        <Info label="Unlocked" value={prog?.unlockedAt ? new Date(prog.unlockedAt).toLocaleDateString() : "—"} />
                        <div className="col-span-2 mt-2 rounded-2xl bg-accent p-3 italic text-foreground">
                          "{open.catchPhrases[0]}"
                        </div>
                      </dl>
                    ) : (
                      <p className="text-muted-foreground">
                        Keep playing to unlock this Sprunki! Level up to meet new friends.
                      </p>
                    )}
                    <BigButton variant="ghost" size="md" onClick={() => setOpen(null)}>
                      Close
                    </BigButton>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setChartOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-[2rem] bg-card p-5 shadow-2xl ring-1 ring-border sm:p-7"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-2xl font-black">✨ Multiplication chart</h3>
                <button
                  onClick={() => setChartOpen(false)}
                  className="rounded-full bg-muted px-3 py-1 text-sm font-bold hover:bg-accent"
                >
                  Close
                </button>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                A reference for your math journey. You earned it!
              </p>
              <MultiplicationChart size={10} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-accent/60 p-3">
      <dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-bold capitalize">{value}</dd>
    </div>
  );
}
