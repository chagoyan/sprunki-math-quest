import { motion, useDragControls } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { SprunkiAvatar } from "@/components/SprunkiAvatar";
import type { Sprunki } from "@/types";

interface Props {
  total: number;
  groups: number;
  guide: Sprunki;
  /** Pool of unlocked Sprunkies to use as recipients (will pick `groups` of them). */
  recipientsPool: Sprunki[];
  /** Called when every recipient has the same count AND all objects are distributed. */
  onSolved: () => void;
  /** Reset on key change (new problem). */
  resetKey: string | number;
}

// Object map keyed by guide icon — Oren shares oranges, Pinki shares flowers, etc.
const OBJECT_MAP: Record<string, { object: string; label: string }> = {
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
  "durple.png": { object: "🫐", label: "berries" },
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
  return OBJECT_MAP[icon] ?? { object: "🎈", label: "balloons" };
}

interface Assignment {
  id: number;
  recipient: number | null; // recipient index, or null if still in pool
}

export function SharingVisual({
  total,
  groups,
  guide,
  recipientsPool,
  onSolved,
  resetKey,
}: Props) {
  const { object, label } = useMemo(() => objectFor(guide.icon), [guide.icon]);

  // Pick recipients: include guide + others from pool, padded with guide if needed.
  const recipients = useMemo<Sprunki[]>(() => {
    const others = recipientsPool.filter((s) => s.id !== guide.id);
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    const picked: Sprunki[] = [guide, ...shuffled.slice(0, Math.max(0, groups - 1))];
    while (picked.length < groups) picked.push(guide);
    return picked;
  }, [groups, guide, recipientsPool, resetKey]);

  const [items, setItems] = useState<Assignment[]>(() =>
    Array.from({ length: total }, (_, i) => ({ id: i, recipient: null })),
  );
  const recipientRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [hint, setHint] = useState<string>("");
  const [solved, setSolved] = useState(false);

  // Reset on new problem
  useEffect(() => {
    setItems(Array.from({ length: total }, (_, i) => ({ id: i, recipient: null })));
    setHint("");
    setSolved(false);
  }, [resetKey, total]);

  // Detect solved state.
  useEffect(() => {
    if (solved) return;
    const counts = new Array(groups).fill(0);
    let undistributed = 0;
    for (const it of items) {
      if (it.recipient === null) undistributed++;
      else counts[it.recipient]++;
    }
    if (undistributed === 0) {
      const equal = counts.every((c) => c === counts[0]);
      if (equal) {
        setSolved(true);
        setHint("");
        onSolved();
      } else {
        setHint("So close! Try to give each friend the same amount.");
      }
    } else if (hint) {
      setHint("");
    }
  }, [items, groups, solved, onSolved, hint]);

  const assign = (itemId: number, recipientIdx: number | null) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, recipient: recipientIdx } : it)));
    if (recipientIdx !== null) sound.correct?.();
  };

  const handleDragEnd = (itemId: number, point: { x: number; y: number }) => {
    for (let i = 0; i < recipients.length; i++) {
      const el = recipientRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom) {
        assign(itemId, i);
        return;
      }
    }
  };

  const reset = () => {
    setItems(Array.from({ length: total }, (_, i) => ({ id: i, recipient: null })));
    setHint("");
  };

  const pool = items.filter((it) => it.recipient === null);
  const recipientCounts = recipients.map((_, i) => items.filter((it) => it.recipient === i).length);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Pool of objects to share */}
      <div className="rounded-3xl bg-gradient-to-b from-[oklch(0.97_0.03_85)] to-[oklch(0.92_0.06_75)] p-3 ring-1 ring-[oklch(0.7_0.12_70)]/30 sm:p-5">
        <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-widest text-[oklch(0.4_0.1_60)] sm:text-sm">
          <span>
            {total} {label} to share
          </span>
          <button
            type="button"
            onClick={reset}
            disabled={pool.length === total || solved}
            className="rounded-full bg-white/80 px-3 py-1 text-[0.65rem] font-bold ring-1 ring-border hover:bg-white disabled:opacity-40 sm:text-xs"
          >
            ⟲ Reset
          </button>
        </div>
        <div className="flex min-h-[3rem] flex-wrap justify-center gap-1 sm:gap-2">
          {pool.length === 0 && !solved && (
            <p className="py-2 text-sm font-bold text-muted-foreground">All shared — but is it fair?</p>
          )}
          {pool.map((it) => (
            <DraggableObject
              key={it.id}
              object={object}
              onDragEnd={(point) => handleDragEnd(it.id, point)}
              disabled={solved}
            />
          ))}
        </div>
      </div>

      <p className="text-center text-xs font-bold text-muted-foreground sm:text-sm">
        Drag {label} to each friend so everyone gets the same.
      </p>

      {/* Recipient zones */}
      <div
        className="grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.min(groups, 5)}, minmax(0, 1fr))` }}
      >
        {recipients.map((s, i) => {
          const count = recipientCounts[i];
          return (
            <div
              key={i}
              ref={(el) => {
                recipientRefs.current[i] = el;
              }}
              className={`flex flex-col items-center gap-1 rounded-2xl p-2 ring-2 transition-colors sm:gap-2 sm:p-3 ${
                solved
                  ? "bg-[oklch(0.95_0.06_150)] ring-[oklch(0.7_0.16_150)]"
                  : "bg-white/70 ring-border/60"
              }`}
            >
              <SprunkiAvatar sprunki={s} size={48} idle={!solved} bouncing={solved} />
              <button
                type="button"
                onClick={() => {
                  // Tap the pile to return one object to the pool — supports correction without dragging.
                  const last = [...items].reverse().find((it) => it.recipient === i);
                  if (last && !solved) assign(last.id, null);
                }}
                className="flex min-h-[2.25rem] flex-wrap justify-center gap-0.5 text-lg leading-none sm:min-h-[2.75rem] sm:text-xl"
                aria-label={`${s.name} has ${count} ${label}. Tap to return one.`}
                disabled={solved || count === 0}
              >
                {Array.from({ length: count }).map((_, j) => (
                  <motion.span
                    key={j}
                    initial={{ scale: 0, y: -8 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                  >
                    {object}
                  </motion.span>
                ))}
              </button>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-black tabular-nums sm:text-xs">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {hint && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm font-bold text-[oklch(0.5_0.18_50)]"
        >
          {hint}
        </motion.p>
      )}
    </div>
  );
}

function DraggableObject({
  object,
  onDragEnd,
  disabled,
}: {
  object: string;
  onDragEnd: (point: { x: number; y: number }) => void;
  disabled?: boolean;
}) {
  const controls = useDragControls();
  return (
    <motion.span
      drag={!disabled}
      dragControls={controls}
      dragSnapToOrigin
      dragMomentum={false}
      whileTap={{ scale: 1.2 }}
      whileDrag={{ scale: 1.35, zIndex: 50 }}
      onDragEnd={(_, info) => onDragEnd({ x: info.point.x, y: info.point.y })}
      style={{ touchAction: "none", WebkitTapHighlightColor: "transparent", cursor: disabled ? "default" : "grab" }}
      className="inline-block select-none text-2xl sm:text-3xl"
      role="button"
      aria-label="Draggable item"
    >
      {object}
    </motion.span>
  );
}
