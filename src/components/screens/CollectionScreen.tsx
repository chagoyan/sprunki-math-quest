import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { SprunkiAvatar } from "@/components/SprunkiAvatar";
import { BigButton } from "@/components/BigButton";
import { sprunkies } from "@/lib/sprunkies";
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

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <button
          onClick={() => go("home")}
          className="rounded-full bg-card px-4 py-2 text-sm font-bold ring-1 ring-border shadow-sm hover:bg-accent"
        >
          ← Home
        </button>
        <h2 className="text-2xl font-black sm:text-3xl">Collection</h2>
        <div className="text-sm font-bold text-muted-foreground">
          {game.unlockedSprunkies.length} / {sprunkies.length}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {sprunkies.map((s) => {
          const prog = game.state.sprunkiProgress[s.id];
          const unlocked = !!prog?.unlockedAt;
          return (
            <motion.button
              key={s.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setOpen(s)}
              className={`flex flex-col items-center gap-3 rounded-3xl bg-card p-4 shadow-sm ring-2 ${rarityRing[s.rarity]} transition-all hover:shadow-md`}
              aria-label={unlocked ? s.name : "Locked Sprunki"}
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
          );
        })}
      </div>

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
