import { motion } from "framer-motion";
import type { Sprunki } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  sprunki: Sprunki;
  size?: number;
  locked?: boolean;
  idle?: boolean;
  bouncing?: boolean;
  className?: string;
}

/**
 * Placeholder avatar — a juicy colored blob with the Sprunki's initial.
 * Swap to <img src={`/images/sprunkies/${sprunki.icon}`} /> once PNGs ship;
 * this component is the only spot that knows.
 */
export function SprunkiAvatar({ sprunki, size = 96, locked, idle, bouncing, className }: Props) {
  const initial = sprunki.name.replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase();
  const color = sprunki.color;

  return (
    <motion.div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      animate={
        bouncing
          ? { y: [0, -14, 0, -6, 0], rotate: [0, -4, 4, -2, 0] }
          : idle
            ? { y: [0, -4, 0], rotate: [-1.5, 1.5, -1.5] }
            : undefined
      }
      transition={
        bouncing
          ? { duration: 0.9, ease: "easeOut" }
          : idle
            ? { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
            : undefined
      }
    >
      {/* squish shadow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/15 blur-md"
        style={{ width: size * 0.7, height: size * 0.12 }}
      />
      <div
        className="relative grid place-items-center overflow-hidden rounded-[38%] shadow-lg"
        style={{
          width: size,
          height: size,
          background: locked
            ? "linear-gradient(160deg, #cbd5e1, #94a3b8)"
            : `radial-gradient(circle at 30% 25%, color-mix(in oklab, ${color} 92%, white 30%), ${color} 65%, color-mix(in oklab, ${color} 70%, black 22%))`,
          boxShadow: locked
            ? "0 8px 18px -8px rgba(0,0,0,0.25), inset 0 -6px 0 rgba(0,0,0,0.15)"
            : `0 12px 26px -10px ${color}88, inset 0 -10px 0 rgba(0,0,0,0.18), inset 0 4px 0 rgba(255,255,255,0.35)`,
        }}
      >
        {/* eyes */}
        <div className="absolute top-[28%] flex w-full items-center justify-center gap-[14%]">
          <div className="grid place-items-center rounded-full bg-white" style={{ width: size * 0.22, height: size * 0.22 }}>
            <div className="rounded-full bg-slate-900" style={{ width: size * 0.1, height: size * 0.1 }} />
          </div>
          <div className="grid place-items-center rounded-full bg-white" style={{ width: size * 0.22, height: size * 0.22 }}>
            <div className="rounded-full bg-slate-900" style={{ width: size * 0.1, height: size * 0.1 }} />
          </div>
        </div>
        {/* mouth */}
        <div
          className="absolute rounded-b-full border-b-[3px] border-slate-900/80"
          style={{
            bottom: size * 0.22,
            width: size * 0.32,
            height: size * 0.16,
            borderColor: locked ? "transparent" : undefined,
          }}
        />
        {/* initial badge */}
        <span
          className="absolute font-black text-white/95 drop-shadow"
          style={{ top: size * 0.06, right: size * 0.08, fontSize: size * 0.18 }}
        >
          {locked ? "?" : initial}
        </span>
        {locked && <div className="absolute inset-0 grid place-items-center text-4xl">🔒</div>}
      </div>
    </motion.div>
  );
}
