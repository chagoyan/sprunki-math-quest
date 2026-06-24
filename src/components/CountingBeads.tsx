import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Operation } from "@/types";
import { Lightbulb } from "lucide-react";
import { getSecondSprunkiAudioUrl } from "@/lib/sprunkiAudio";
import { music } from "@/lib/music";

interface Props {
  a: number;
  b: number;
  operation: Operation;
  solved?: boolean;
  guideIcon?: string;
}

interface Bead {
  id: number;
  active: boolean;
}

function buildRow(): Bead[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i,
    active: false,
  }));
}

export function CountingBeads({ operation, solved, guideIcon }: Props) {
  const [topRow, setTopRow] = useState<Bead[]>(() => buildRow());
  const [bottomRow, setBottomRow] = useState<Bead[]>(() => buildRow());

  useEffect(() => {
    setTopRow(buildRow());
    setBottomRow(buildRow());
  }, [operation]);

  useEffect(() => {
    if (solved) {
      setTopRow(buildRow());
      setBottomRow(buildRow());
    }
  }, [solved]);

  const playBeadSound = () => {
    if (!guideIcon) return;
    const url = getSecondSprunkiAudioUrl(guideIcon);
    if (url) music.playEffect(url);
  };

  const toggleTop = (id: number) => {
    playBeadSound();
    setTopRow((prev) =>
      prev.map((bead) =>
        bead.id === id ? { ...bead, active: !bead.active } : bead
      )
    );
  };

  const toggleBottom = (id: number) => {
    playBeadSound();
    setBottomRow((prev) =>
      prev.map((bead) =>
        bead.id === id ? { ...bead, active: !bead.active } : bead
      )
    );
  };

  const [showHint, setShowHint] = useState(false);

  const topActive = topRow.filter((b) => b.active).length;
  const bottomActive = bottomRow.filter((b) => b.active).length;
  const totalActive = operation === "subtraction" ? topActive : topActive + bottomActive;

  return (
    <div className="rounded-[1.5rem] bg-gradient-to-b from-[oklch(0.9_0.04_75)] to-[oklch(0.82_0.06_70)] p-3 ring-1 ring-[oklch(0.6_0.1_60)]/25 shadow-inner sm:p-4">
      {/* Counter header */}
      <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[oklch(0.4_0.06_60)]">
        <span>Tap beads to count!</span>
        <button
          type="button"
          onClick={() => setShowHint((v) => !v)}
          className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-[oklch(0.3_0.06_60)] ring-1 ring-[oklch(0.6_0.1_60)]/15 tabular-nums hover:bg-white transition-colors"
          aria-pressed={showHint}
        >
          <Lightbulb className="h-3 w-3" />
          {showHint ? (operation === "subtraction" ? `${topActive} left` : `${totalActive} total`) : "Hint"}
        </button>
      </div>

      {/* Abacus frame */}
      <div className="flex flex-col gap-2 rounded-2xl bg-[oklch(0.78_0.08_65)]/40 p-3 ring-1 ring-[oklch(0.6_0.08_60)]/20 sm:gap-3 sm:p-4">
        {/* Row 1 — warm/amber beads */}
        <AbacusRow
          beads={topRow}
          color="warm"
          onToggle={toggleTop}
        />

        {/* Row 2 — cool/sky beads */}
        <AbacusRow
          beads={bottomRow}
          color="cool"
          onToggle={toggleBottom}
        />
      </div>
    </div>
  );
}

function AbacusRow({
  beads,
  color,
  onToggle,
}: {
  beads: Bead[];
  color: "warm" | "cool";
  onToggle: (id: number) => void;
}) {
  const gradient =
    color === "warm"
      ? "from-[oklch(0.82_0.16_55)] to-[oklch(0.58_0.2_45)] shadow-[0_3px_0_oklch(0.42_0.16_40)]"
      : "from-[oklch(0.78_0.14_230)] to-[oklch(0.56_0.18_240)] shadow-[0_3px_0_oklch(0.38_0.14_245)]";

  return (
    <div className="relative flex items-center">
      {/* Rod line */}
      <div className="pointer-events-none absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 rounded-full bg-[oklch(0.55_0.08_60)]/30" />
      {/* Center divider */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-7 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.55_0.08_60)]/40 sm:h-9" />

      <div className="relative z-10 flex w-full items-center justify-between gap-0.5 sm:gap-1">
        {beads.map((bead) => (
          <motion.button
            key={bead.id}
            type="button"
            onClick={() => onToggle(bead.id)}
            whileTap={{ scale: 0.82 }}
            animate={{
              scale: bead.active ? 1.08 : 1,
              y: bead.active ? -3 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 24,
            }}
            className={[
              "relative h-6 w-6 rounded-full bg-gradient-to-b ring-1 ring-black/10 sm:h-8 sm:w-8",
              gradient,
            ].join(" ")}
            aria-label={`Bead ${bead.id + 1}`}
          >
            {bead.active && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[oklch(0.9_0.18_95)] ring-1 ring-[oklch(0.7_0.2_90)] shadow-sm sm:h-3 sm:w-3"
                aria-hidden
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
