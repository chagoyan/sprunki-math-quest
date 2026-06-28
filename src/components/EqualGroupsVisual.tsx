import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { SprunkiAvatar } from "@/components/SprunkiAvatar";
import type { Sprunki } from "@/types";

interface Props {
  groups: number;
  perGroup: number;
  guide: Sprunki;
  /** True after the child has answered correctly — groups merge into a single collection. */
  solved: boolean;
}

// Each Sprunki carries a different object so every problem feels fresh.
// Keys are the icon filename (with extension) as stored on the Sprunki record.
const SPRUNKI_OBJECTS: Record<string, { object: string; label: string }> = {
  "oren.png": { object: "🍊", label: "oranges" },
  "raddy.png": { object: "🍎", label: "apples" },
  "clukr.png": { object: "🥚", label: "eggs" },
  "funbot.png": { object: "⚙️", label: "gears" },
  "vineria.png": { object: "🍇", label: "grapes" },
  "pinki.png": { object: "🌸", label: "flowers" },
  "mrsun.png": { object: "⭐", label: "stars" },
  "mrtree.png": { object: "🍂", label: "leaves" },
  "gray.png": { object: "📚", label: "books" },
  "jevin.png": { object: "🎲", label: "dice" },
  "durple.png": { object: "🍇", label: "berries" },
  "garnold.png": { object: "🥇", label: "medals" },
  "simon.png": { object: "🎵", label: "notes" },
  "sky.png": { object: "☁️", label: "clouds" },
  "tunner.png": { object: "🎶", label: "tunes" },
  "wenda.png": { object: "🌈", label: "rainbows" },
  "mrfuncomputer.png": { object: "💻", label: "chips" },
  "owakcx.png": { object: "🔮", label: "orbs" },
  "brud.png": { object: "🍪", label: "cookies" },
  "black.png": { object: "🌑", label: "moons" },
};

function objectFor(icon: string) {
  return SPRUNKI_OBJECTS[icon] ?? { object: "🎈", label: "balloons" };
}

export function EqualGroupsVisual({ groups, perGroup, guide, solved }: Props) {
  const { object, label } = useMemo(() => objectFor(guide.icon), [guide.icon]);
  const total = groups * perGroup;

  // After solving, merge all objects into one cluster.
  if (solved) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-b from-[oklch(0.96_0.04_140)] to-[oklch(0.92_0.06_150)] p-4 ring-1 ring-[oklch(0.7_0.12_150)]/30 sm:p-6">
        <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.4_0.12_150)] sm:text-sm">
          {groups} groups of {perGroup} = {total} {label}
        </p>
        <div className="flex max-w-xs flex-wrap justify-center gap-1 text-2xl sm:max-w-md sm:gap-1.5 sm:text-3xl">
          {Array.from({ length: total }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 18,
                delay: i * 0.025,
              }}
              aria-hidden
            >
              {object}
            </motion.span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[oklch(0.97_0.02_240)] to-[oklch(0.93_0.04_250)] p-3 ring-1 ring-[oklch(0.7_0.1_240)]/25 sm:p-5">
      <p className="mb-3 text-center text-xs font-black uppercase tracking-widest text-muted-foreground sm:text-sm">
        How many altogether?
      </p>
      <div className="flex flex-col gap-2 sm:gap-3">
        <AnimatePresence initial={false}>
          {Array.from({ length: groups }).map((_, gi) => (
            <motion.div
              key={`${guide.id}-${groups}-${perGroup}-${gi}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: gi * 0.18, type: "spring", stiffness: 260, damping: 22 }}
              className="flex items-center gap-2 rounded-2xl bg-white/70 p-2 ring-1 ring-border/50 shadow-sm sm:gap-3 sm:p-3"
            >
              <div className="shrink-0">
                <SprunkiAvatar sprunki={guide} size={40} idle />
              </div>
              <div className="flex flex-1 flex-wrap items-center gap-1 text-xl sm:gap-1.5 sm:text-2xl">
                {Array.from({ length: perGroup }).map((_, oi) => (
                  <motion.span
                    key={oi}
                    initial={{ scale: 0, y: -10 }}
                    animate={{ scale: [0, 1.2, 1], y: [-10, 0, 0] }}
                    transition={{
                      delay: gi * 0.18 + 0.12 + oi * 0.07,
                      duration: 0.45,
                    }}
                    aria-hidden
                  >
                    {object}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
