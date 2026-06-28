import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent as ReactTouchEvent } from "react";
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
  const [drag, setDrag] = useState<{
    itemId: number;
    pointerId: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const dragRef = useRef<typeof drag>(null);
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dragListenersRef = useRef<{
    move: (event: PointerEvent) => void;
    up: (event: PointerEvent) => void;
    cancel: (event: PointerEvent) => void;
    touchMove: (event: TouchEvent) => void;
    touchEnd: (event: TouchEvent) => void;
    touchCancel: (event: TouchEvent) => void;
  } | null>(null);
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
    setDrag(null);
    dragRef.current = null;
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

    const target = document.elementFromPoint(x, y) as HTMLElement | null;
    const recipientEl = target?.closest<HTMLElement>("[data-share-recipient]");
    const recipientIndex = recipientEl?.dataset.shareRecipient;
    if (recipientIndex !== undefined) {
      const parsed = Number(recipientIndex);
      if (Number.isInteger(parsed)) {
        setDebugPointer({ x, y, hit: `#${parsed} (elementFromPoint:${target?.tagName ?? "?"})` });
        return parsed;
      }
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
        setDebugPointer({ x, y, hit: `#${i} (bbox; under=${target?.tagName ?? "?"})` });
        return i;
      }
    }
    setDebugPointer({ x, y, hit: `miss (under=${target?.tagName ?? "?"}${target?.className ? " ." + String(target.className).slice(0, 24) : ""})` });
    return null;
  }, []);

  const reset = () => {
    setItems(Array.from({ length: total }, (_, i) => ({ id: i, recipient: null })));
    setHint("");
    setSelectedId(null);
    setDrag(null);
    dragRef.current = null;
  };

  const removeDragListeners = useCallback(() => {
    const listeners = dragListenersRef.current;
    if (!listeners) return;
    window.removeEventListener("pointermove", listeners.move, true);
    window.removeEventListener("pointerup", listeners.up, true);
    window.removeEventListener("pointercancel", listeners.cancel, true);
    document.removeEventListener("pointermove", listeners.move, true);
    document.removeEventListener("pointerup", listeners.up, true);
    document.removeEventListener("pointercancel", listeners.cancel, true);
    window.removeEventListener("touchmove", listeners.touchMove, true);
    window.removeEventListener("touchend", listeners.touchEnd, true);
    window.removeEventListener("touchcancel", listeners.touchCancel, true);
    document.removeEventListener("touchmove", listeners.touchMove, true);
    document.removeEventListener("touchend", listeners.touchEnd, true);
    document.removeEventListener("touchcancel", listeners.touchCancel, true);
    dragListenersRef.current = null;
  }, []);

  const finishDrag = useCallback(
    (itemId: number, pointerId: number, x: number, y: number, moved: boolean, cancelled = false) => {
      removeDragListeners();
      const button = activeButtonRef.current;
      try {
        if (button?.hasPointerCapture(pointerId)) button.releasePointerCapture(pointerId);
      } catch {
        // Ignore browsers that already released capture.
      }
      activeButtonRef.current = null;
      dragRef.current = null;
      setDrag(null);
      setHoverRecipient(null);

      if (cancelled) {
        pushDebug(`drag cancel item #${itemId}`);
        return;
      }

      if (!moved) {
        pushDebug(`tap item #${itemId}`);
        setSelectedId((cur) => (cur === itemId ? null : itemId));
        return;
      }

      const idx = recipientAtPoint(x, y);
      pushDebug(`drop item #${itemId} @ (${Math.round(x)},${Math.round(y)}) → ${idx === null ? "MISS" : "#" + idx}`);
      if (idx !== null) assign(itemId, idx);
    },
    [assign, pushDebug, recipientAtPoint, removeDragListeners],
  );

  useEffect(() => {
    return removeDragListeners;
  }, [removeDragListeners]);

  const beginDrag = useCallback((button: HTMLButtonElement, itemId: number, pointerId: number, x: number, y: number) => {
    if (solved || dragRef.current) return;
    const next = {
      itemId,
      pointerId,
      startX: x,
      startY: y,
      x,
      y,
      moved: false,
    };
    activeButtonRef.current = button;
    try {
      if (pointerId >= 0) button.setPointerCapture(pointerId);
    } catch {
      // Window-level listeners still track the drag.
    }
    dragRef.current = next;
    setDrag(next);
    setDebugPointer({ x, y, hit: pointerId >= 0 ? "pointer drag start" : "touch drag start" });
    pushDebug(`drag start item #${itemId}`);

    const moveTo = (clientX: number, clientY: number) => {
      const current = dragRef.current;
      if (!current) return;
      const dx = clientX - current.startX;
      const dy = clientY - current.startY;
      const moved = current.moved || Math.hypot(dx, dy) > 4;
      const updated = { ...current, x: clientX, y: clientY, moved };
      dragRef.current = updated;
      setDrag(updated);
      if (moved) setHoverRecipient(recipientAtPoint(clientX, clientY));
    };

    const move = (moveEvent: PointerEvent) => {
      const current = dragRef.current;
      if (!current || moveEvent.pointerId !== current.pointerId) return;
      moveEvent.preventDefault();
      moveTo(moveEvent.clientX, moveEvent.clientY);
    };

    const up = (upEvent: PointerEvent) => {
      const current = dragRef.current;
      if (!current || upEvent.pointerId !== current.pointerId) return;
      upEvent.preventDefault();
      finishDrag(current.itemId, current.pointerId, upEvent.clientX, upEvent.clientY, current.moved);
    };

    const cancel = (cancelEvent: PointerEvent) => {
      const current = dragRef.current;
      if (!current || cancelEvent.pointerId !== current.pointerId) return;
      finishDrag(current.itemId, current.pointerId, cancelEvent.clientX, cancelEvent.clientY, current.moved, true);
    };

    const touchMove = (touchEvent: TouchEvent) => {
      const current = dragRef.current;
      const touch = touchEvent.touches[0] ?? touchEvent.changedTouches[0];
      if (!current || !touch) return;
      touchEvent.preventDefault();
      moveTo(touch.clientX, touch.clientY);
    };

    const touchEnd = (touchEvent: TouchEvent) => {
      const current = dragRef.current;
      const touch = touchEvent.changedTouches[0];
      if (!current) return;
      touchEvent.preventDefault();
      finishDrag(current.itemId, current.pointerId, touch?.clientX ?? current.x, touch?.clientY ?? current.y, current.moved);
    };

    const touchCancel = (touchEvent: TouchEvent) => {
      const current = dragRef.current;
      const touch = touchEvent.changedTouches[0];
      if (!current) return;
      finishDrag(current.itemId, current.pointerId, touch?.clientX ?? current.x, touch?.clientY ?? current.y, current.moved, true);
    };

    removeDragListeners();
    dragListenersRef.current = { move, up, cancel, touchMove, touchEnd, touchCancel };
    window.addEventListener("pointermove", move, { passive: false, capture: true });
    window.addEventListener("pointerup", up, { passive: false, capture: true });
    window.addEventListener("pointercancel", cancel, { capture: true });
    document.addEventListener("pointermove", move, { passive: false, capture: true });
    document.addEventListener("pointerup", up, { passive: false, capture: true });
    document.addEventListener("pointercancel", cancel, { capture: true });
    window.addEventListener("touchmove", touchMove, { passive: false, capture: true });
    window.addEventListener("touchend", touchEnd, { passive: false, capture: true });
    window.addEventListener("touchcancel", touchCancel, { capture: true });
    document.addEventListener("touchmove", touchMove, { passive: false, capture: true });
    document.addEventListener("touchend", touchEnd, { passive: false, capture: true });
    document.addEventListener("touchcancel", touchCancel, { capture: true });
  }, [finishDrag, pushDebug, recipientAtPoint, removeDragListeners, solved]);

  const startDrag = (event: React.PointerEvent<HTMLButtonElement>, itemId: number) => {
    event.preventDefault();
    event.stopPropagation();
    beginDrag(event.currentTarget, itemId, event.pointerId, event.clientX, event.clientY);
  };

  const startTouchDrag = (event: ReactTouchEvent<HTMLButtonElement>, itemId: number) => {
    if (dragRef.current) return;
    const touch = event.touches[0] ?? event.changedTouches[0];
    if (!touch) return;
    event.preventDefault();
    event.stopPropagation();
    beginDrag(event.currentTarget, itemId, -1, touch.clientX, touch.clientY);
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
            <button
              key={it.id}
              type="button"
              disabled={solved}
              onPointerDown={(event) => startDrag(event, it.id)}
              onPointerMove={(event) => dragListenersRef.current?.move(event.nativeEvent)}
              onPointerUp={(event) => dragListenersRef.current?.up(event.nativeEvent)}
              onPointerCancel={(event) => dragListenersRef.current?.cancel(event.nativeEvent)}
              onTouchStart={(event) => startTouchDrag(event, it.id)}
              style={{
                touchAction: "none",
                WebkitTapHighlightColor: "transparent",
                cursor: solved ? "default" : drag?.itemId === it.id ? "grabbing" : "grab",
              }}
              className={`inline-flex h-12 w-12 select-none items-center justify-center rounded-full p-1 text-2xl transition-all sm:h-14 sm:w-14 sm:text-3xl ${
                drag?.itemId === it.id
                  ? "opacity-30"
                  : selectedId === it.id
                    ? "bg-[oklch(0.92_0.1_240)] ring-2 ring-[oklch(0.6_0.2_240)] shadow-md"
                    : "hover:bg-white/70"
              }`}
              aria-label="Draggable item"
              aria-pressed={selectedId === it.id}
            >
              <span className="pointer-events-none">{object}</span>
            </button>
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

      {/* Debug overlay — verify pointer events, hit detection, counts */}
      <div className="rounded-xl border-2 border-dashed border-fuchsia-400 bg-black/85 p-2 font-mono text-[10px] leading-tight text-fuchsia-100 sm:text-xs">
        <div className="mb-1 flex flex-wrap gap-x-3 gap-y-0.5 font-bold text-fuchsia-300">
          <span>DEBUG</span>
          <span>pool={pool.length}/{total}</span>
          <span>selected={selectedId ?? "—"}</span>
          <span>hover={hoverRecipient ?? "—"}</span>
          <span>solved={String(solved)}</span>
          <span>counts=[{recipientCounts.join(",")}]</span>
        </div>
        <div className="mb-1 text-fuchsia-200">
          pointer={debugPointer ? `(${Math.round(debugPointer.x)},${Math.round(debugPointer.y)}) → ${debugPointer.hit ?? "—"}` : "—"}
        </div>
        <div className="max-h-28 overflow-y-auto">
          {debugLog.length === 0 ? (
            <div className="opacity-50">no events yet — try dragging or tapping</div>
          ) : (
            debugLog.map((line, i) => <div key={i}>{line}</div>)
          )}
        </div>
      </div>

      {/* Live pointer crosshair when dragging */}
      {debugPointer && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: debugPointer.x - 8,
            top: debugPointer.y - 8,
            width: 16,
            height: 16,
            borderRadius: "9999px",
            border: "2px solid magenta",
            background: "rgba(255,0,255,0.25)",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        />
      )}

      {drag && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: drag.x,
            top: drag.y,
            transform: "translate(-50%, -50%) scale(1.35)",
            zIndex: 9998,
            pointerEvents: "none",
            fontSize: "2.25rem",
            lineHeight: 1,
            filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.25))",
          }}
        >
          {object}
        </div>
      )}
    </div>
  );
}
