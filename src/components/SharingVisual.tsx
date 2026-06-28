import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SprunkiAvatar } from "@/components/SprunkiAvatar";
import type { Sprunki } from "@/types";

interface Props {
  total: number;
  groups: number;
  guide: Sprunki;
  recipientsPool: Sprunki[];
  onSolved: () => void;
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
  recipient: number | null;
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

  const recipients = useMemo<Sprunki[]>(() => {
    const others = recipientsPool.filter((s) => s.id !== guide.id);
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    const picked: Sprunki[] = [guide, ...shuffled.slice(0, Math.max(0, groups - 1))];
    while (picked.length < groups) picked.push(guide);
    return picked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, guide, resetKey]);

  const [items, setItems] = useState<Assignment[]>(() =>
    Array.from({ length: total }, (_, i) => ({ id: i, recipient: null })),
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoverRecipient, setHoverRecipient] = useState<number | null>(null);
  const recipientRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [hint, setHint] = useState<string>("");
  const [solved, setSolved] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [debugPointer, setDebugPointer] = useState<{ x: number; y: number; hit: string | null } | null>(null);
  const pushDebug = useCallback((msg: string) => {
    setDebugLog((prev) => {
      const ts = new Date().toISOString().slice(14, 23);
      return [`${ts} ${msg}`, ...prev].slice(0, 10);
    });
  }, []);

  useEffect(() => {
    setItems(Array.from({ length: total }, (_, i) => ({ id: i, recipient: null })));
    setHint("");
    setSolved(false);
    setSelectedId(null);
  }, [resetKey, total]);

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

  const assign = useCallback((itemId: number, recipientIdx: number | null) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, recipient: recipientIdx } : it)));
  }, []);

  const recipientAtPoint = useCallback((x: number, y: number) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

    const target = document.elementFromPoint(x, y);
    const recipientEl = target?.closest<HTMLElement>("[data-share-recipient]");
    const recipientIndex = recipientEl?.dataset.shareRecipient;
    if (recipientIndex !== undefined) {
      const parsed = Number(recipientIndex);
      if (Number.isInteger(parsed)) return parsed;
    }

    for (let i = 0; i < recipientRefs.current.length; i++) {
      const el = recipientRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const padding = 18;
      if (
        x >= r.left - padding &&
        x <= r.right + padding &&
        y >= r.top - padding &&
        y <= r.bottom + padding
      ) {
        return i;
      }
    }
    return null;
  }, []);

  const reset = () => {
    setItems(Array.from({ length: total }, (_, i) => ({ id: i, recipient: null })));
    setHint("");
    setSelectedId(null);
  };

  const pool = items.filter((it) => it.recipient === null);
  const recipientCounts = recipients.map((_, i) => items.filter((it) => it.recipient === i).length);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
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
            <DragObject
              key={it.id}
              object={object}
              disabled={solved}
              selected={selectedId === it.id}
              onTap={() => setSelectedId((cur) => (cur === it.id ? null : it.id))}
              onDrop={(x, y) => {
                const idx = recipientAtPoint(x, y);
                if (idx !== null) assign(it.id, idx);
                setHoverRecipient(null);
              }}
              onDragMove={(x, y) => setHoverRecipient(recipientAtPoint(x, y))}
            />
          ))}
        </div>
      </div>

      <p className="text-center text-xs font-bold text-muted-foreground sm:text-sm">
        Drag {label} to a friend — or tap one, then tap a friend.
      </p>

      <div
        className="grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.min(groups, 5)}, minmax(0, 1fr))` }}
      >
        {recipients.map((s, i) => {
          const count = recipientCounts[i];
          const isHover = hoverRecipient === i;
          const onRecipientTap = () => {
            if (solved) return;
            // If an object is selected from the pool, send it here.
            if (selectedId !== null && items.find((it) => it.id === selectedId)?.recipient === null) {
              assign(selectedId, i);
              setSelectedId(null);
              return;
            }
            // Otherwise tap to return the last object to the pool.
            const last = [...items].reverse().find((it) => it.recipient === i);
            if (last) assign(last.id, null);
          };
          return (
            <div
              key={i}
              data-share-recipient={i}
              ref={(el) => {
                recipientRefs.current[i] = el;
              }}
              onClick={onRecipientTap}
              role="button"
              aria-label={`${s.name} has ${count} ${label}`}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl p-2 ring-2 transition-all sm:gap-2 sm:p-3 ${
                solved
                  ? "bg-[oklch(0.95_0.06_150)] ring-[oklch(0.7_0.16_150)]"
                  : isHover
                    ? "bg-[oklch(0.96_0.08_85)] ring-[oklch(0.7_0.18_70)] scale-105"
                    : selectedId !== null
                      ? "bg-white ring-[oklch(0.78_0.14_240)]/70"
                      : "bg-white/70 ring-border/60 hover:bg-white"
              }`}
            >
              <SprunkiAvatar sprunki={s} size={48} idle={!solved} bouncing={solved || isHover} />
              <div className="pointer-events-none flex min-h-[2.25rem] flex-wrap justify-center gap-0.5 text-lg leading-none sm:min-h-[2.75rem] sm:text-xl">
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
              </div>
              <span className="pointer-events-none rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-black tabular-nums sm:text-xs">
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

function DragObject({
  object,
  disabled,
  selected,
  onTap,
  onDrop,
  onDragMove,
}: {
  object: string;
  disabled?: boolean;
  selected?: boolean;
  onTap: () => void;
  onDrop: (x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const stateRef = useRef({
    startX: 0,
    startY: 0,
    pointerId: -1,
    dragging: false,
    moved: false,
  });
  const callbacksRef = useRef({ onTap, onDrop, onDragMove });
  const listenersRef = useRef<{
    move: (event: PointerEvent) => void;
    up: (event: PointerEvent) => void;
    cancel: (event: PointerEvent) => void;
  } | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    callbacksRef.current = { onTap, onDrop, onDragMove };
  }, [onTap, onDrop, onDragMove]);

  const removeWindowListeners = useCallback(() => {
    const listeners = listenersRef.current;
    if (!listeners) return;
    window.removeEventListener("pointermove", listeners.move);
    window.removeEventListener("pointerup", listeners.up);
    window.removeEventListener("pointercancel", listeners.cancel);
    listenersRef.current = null;
  }, []);

  const finishDrag = useCallback(
    (pointerId: number, clientX: number, clientY: number, cancelled = false) => {
      const st = stateRef.current;
      if (!st.dragging || st.pointerId !== pointerId) return;

      removeWindowListeners();
      const moved = st.moved;
      stateRef.current = {
        ...st,
        pointerId: -1,
        dragging: false,
        moved: false,
      };

      const el = ref.current;
      try {
        if (el?.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
      } catch {
        // Some touch browsers throw when capture has already been released.
      }

      setOffset(null);
      callbacksRef.current.onDragMove(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
      if (cancelled) return;
      if (moved) callbacksRef.current.onDrop(clientX, clientY);
      else callbacksRef.current.onTap();
    },
    [removeWindowListeners],
  );

  useEffect(() => removeWindowListeners, [removeWindowListeners]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    removeWindowListeners();
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // Window listeners below still keep the drag alive if capture is unavailable.
    }
    stateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
      dragging: true,
      moved: false,
    };
    setOffset({ x: 0, y: 0 });

    const pointerId = e.pointerId;
    const move = (event: PointerEvent) => {
      const st = stateRef.current;
      if (!st.dragging || event.pointerId !== pointerId) return;
      event.preventDefault();
      const dx = event.clientX - st.startX;
      const dy = event.clientY - st.startY;
      if (!st.moved && Math.hypot(dx, dy) > 5) st.moved = true;
      setOffset({ x: dx, y: dy });
      if (st.moved) callbacksRef.current.onDragMove(event.clientX, event.clientY);
    };
    const up = (event: PointerEvent) => {
      finishDrag(event.pointerId, event.clientX, event.clientY);
    };
    const cancel = (event: PointerEvent) => {
      finishDrag(event.pointerId, event.clientX, event.clientY, true);
    };

    listenersRef.current = { move, up, cancel };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  };

  return (
    <button
      ref={ref}
      type="button"
      onPointerDown={handlePointerDown}
      disabled={disabled}
      style={{
        touchAction: "none",
        WebkitTapHighlightColor: "transparent",
        pointerEvents: offset ? "none" : undefined,
        transform: offset ? `translate(${offset.x}px, ${offset.y}px) scale(1.35)` : undefined,
        zIndex: offset ? 50 : undefined,
        position: offset ? "relative" : undefined,
        cursor: disabled ? "default" : offset ? "grabbing" : "grab",
      }}
      className={`inline-flex select-none items-center justify-center rounded-full p-1 text-2xl transition-shadow sm:text-3xl ${
        selected ? "bg-[oklch(0.92_0.1_240)] ring-2 ring-[oklch(0.6_0.2_240)] shadow-md" : ""
      }`}
      aria-label="Draggable item"
      aria-pressed={selected}
    >
      <span className="pointer-events-none">{object}</span>
    </button>
  );
}
