import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Operation } from "@/types";

interface Props {
  a: number;
  b: number;
  operation: Operation;
}

interface Bead {
  key: string;
  group: "a" | "b";
  removed: boolean; // for subtraction crossing-out
  flicked: boolean; // user tapped to count
}

function buildBeads(a: number, b: number, operation: Operation): Bead[] {
  const beads: Bead[] = [];
  for (let i = 0; i < a; i++) beads.push({ key: `a-${i}`, group: "a", removed: false, flicked: false });
  const bCount = operation === "subtraction" ? Math.min(b, a) : b;
  for (let i = 0; i < bCount; i++) {
    beads.push({
      key: `b-${i}`,
      group: "b",
      removed: false,
      flicked: false,
    });
  }
  return beads;
}

const groupStyles: Record<"a" | "b", string> = {
  a: "from-[oklch(0.82_0.18_50)] to-[oklch(0.62_0.22_40)] shadow-[0_4px_0_oklch(0.45_0.18_40)]",
  b: "from-[oklch(0.82_0.18_240)] to-[oklch(0.6_0.22_250)] shadow-[0_4px_0_oklch(0.42_0.18_255)]",
};

export function CountingBeads({ a, b, operation }: Props) {
  const [beads, setBeads] = useState<Bead[]>(() => buildBeads(a, b, operation));

  useEffect(() => {
    setBeads(buildBeads(a, b, operation));
  }, [a, b, operation]);

  const toggle = (idx: number) => {
    setBeads((prev) => {
      const next = [...prev];
      const bead = { ...next[idx] };
      if (operation === "subtraction" && bead.group === "a") {
        bead.removed = !bead.removed;
      } else {
        bead.flicked = !bead.flicked;
      }
      next[idx] = bead;
      return next;
    });
  };

  const remaining = beads.filter((bd) => !bd.removed).length;
  const flicked = beads.filter((bd) => bd.flicked && !bd.removed).length;

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[oklch(0.98_0.02_80)] to-[oklch(0.94_0.04_70)] p-4 ring-1 ring-border/60 shadow-inner">
      <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <span>Tap the beads to count!</span>
        <span className="rounded-full bg-white px-3 py-1 text-foreground ring-1 ring-border tabular-nums">
          {operation === "subtraction" ? `${remaining} left` : `${flicked} / ${remaining}`}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {beads.map((bead, idx) => (
          <motion.button
            key={bead.key}
            type="button"
            onClick={() => toggle(idx)}
            whileTap={{ scale: 0.85 }}
            animate={{
              opacity: bead.removed ? 0.25 : 1,
              scale: bead.flicked ? 1.1 : 1,
              y: bead.flicked ? -4 : 0,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className={[
              "relative h-9 w-9 rounded-full bg-gradient-to-b ring-1 ring-black/10 sm:h-11 sm:w-11",
              groupStyles[bead.group],
              bead.removed ? "line-through" : "",
            ].join(" ")}
            aria-label={`Bead ${idx + 1}`}
          >
            {bead.removed && (
              <span className="pointer-events-none absolute inset-0 grid place-items-center text-2xl font-black text-red-600">
                ✕
              </span>
            )}
            {bead.flicked && !bead.removed && (
              <span className="pointer-events-none absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow-300 ring-2 ring-white" />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
