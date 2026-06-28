import { useCallback, useEffect, useRef, useState } from "react";
import type { Screen } from "@/components/MathQuestApp";

interface Props {
  go: (s: Screen) => void;
}

interface PointerSample {
  t: number;
  type: string;
  pointerType?: string;
  pointerId?: number;
  x: number;
  y: number;
  buttons?: number;
  target: string;
  hit: string | null;
  captured?: boolean;
}

interface DragState {
  itemId: number;
  pointerId: number;
  x: number;
  y: number;
  moved: boolean;
}

const ITEMS = [0, 1, 2, 3, 4, 5];
const TARGETS = [0, 1, 2];

function describe(el: Element | null): string {
  if (!el) return "null";
  const tag = el.tagName.toLowerCase();
  const id = (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : "";
  const cls = (el as HTMLElement).className
    ? "." + String((el as HTMLElement).className).split(/\s+/).filter(Boolean).slice(0, 2).join(".")
    : "";
  const dd = (el as HTMLElement).dataset?.dndTarget;
  const ddi = (el as HTMLElement).dataset?.dndItem;
  return `${tag}${id}${cls}${dd !== undefined ? `[target=${dd}]` : ""}${ddi !== undefined ? `[item=${ddi}]` : ""}`;
}

export function DndTestScreen({ go }: Props) {
  const [drops, setDrops] = useState<Record<number, number>>({}); // itemId -> targetId
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [log, setLog] = useState<PointerSample[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const targetRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const itemRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const pushSample = useCallback((s: PointerSample) => {
    setLog((prev) => [s, ...prev].slice(0, 18));
  }, []);

  const hitTest = useCallback((x: number, y: number) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const t = el?.closest<HTMLElement>("[data-dnd-target]");
    const idx = t?.dataset.dndTarget;
    return { idx: idx !== undefined ? Number(idx) : null, under: el };
  }, []);

  const reset = () => {
    setDrops({});
    setLog([]);
    setHover(null);
    setDrag(null);
    dragRef.current = null;
  };

  const runSelfTest = useCallback(() => {
    // Programmatically test hit detection by sampling each target's centerpoint.
    const results: PointerSample[] = [];
    for (const i of TARGETS) {
      const el = targetRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const { idx, under } = hitTest(x, y);
      results.unshift({
        t: performance.now(),
        type: "selftest",
        x,
        y,
        target: describe(under),
        hit: idx === null ? null : `#${idx}`,
      });
    }
    setLog((prev) => [...results, ...prev].slice(0, 18));
  }, [hitTest]);

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointerId) return;
      e.preventDefault();
      const { idx, under } = hitTest(e.clientX, e.clientY);
      const next = { ...drag, x: e.clientX, y: e.clientY, moved: true };
      dragRef.current = next;
      setDrag(next);
      setHover(idx);
      pushSample({
        t: performance.now(),
        type: e.type,
        pointerType: e.pointerType,
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        buttons: e.buttons,
        target: describe(under),
        hit: idx === null ? null : `#${idx}`,
      });
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointerId) return;
      const { idx, under } = hitTest(e.clientX, e.clientY);
      pushSample({
        t: performance.now(),
        type: e.type,
        pointerType: e.pointerType,
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        target: describe(under),
        hit: idx === null ? null : `#${idx}`,
      });
      if (idx !== null) setDrops((p) => ({ ...p, [drag.itemId]: idx }));
      setDrag(null);
      dragRef.current = null;
      setHover(null);
    };
    const cancel = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointerId) return;
      pushSample({
        t: performance.now(),
        type: e.type,
        pointerType: e.pointerType,
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        target: "(cancel)",
        hit: null,
      });
      setDrag(null);
      dragRef.current = null;
      setHover(null);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [drag, hitTest, pushSample]);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>, itemId: number) => {
    e.preventDefault();
    const { idx, under } = hitTest(e.clientX, e.clientY);
    let captured = false;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
      captured = e.currentTarget.hasPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    pushSample({
      t: performance.now(),
      type: e.type,
      pointerType: e.pointerType,
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      buttons: e.buttons,
      target: describe(under),
      hit: idx === null ? null : `#${idx}`,
      captured,
    });
    const next: DragState = {
      itemId,
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      moved: false,
    };
    dragRef.current = next;
    setDrag(next);
  };

  const itemsInPool = ITEMS.filter((i) => drops[i] === undefined);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-2">
        <button
          onClick={() => go("home")}
          className="rounded-full bg-card px-3 py-2 text-xs font-bold ring-1 ring-border shadow-sm hover:bg-accent"
        >
          ← Home
        </button>
        <h2 className="text-lg font-black">DnD Self-Test</h2>
        <div className="flex gap-2">
          <button
            onClick={runSelfTest}
            className="rounded-full bg-card px-3 py-2 text-xs font-bold ring-1 ring-border shadow-sm hover:bg-accent"
          >
            🎯 Hit-test
          </button>
          <button
            onClick={reset}
            className="rounded-full bg-card px-3 py-2 text-xs font-bold ring-1 ring-border shadow-sm hover:bg-accent"
          >
            ⟲ Reset
          </button>
        </div>
      </header>

      <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-300/50">
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-amber-900">
          Pool ({itemsInPool.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {itemsInPool.map((id) => (
            <button
              key={id}
              ref={(el) => {
                itemRefs.current[id] = el;
              }}
              data-dnd-item={id}
              type="button"
              onPointerDown={(e) => onPointerDown(e, id)}
              style={{ touchAction: "none", WebkitTapHighlightColor: "transparent" }}
              className={`grid h-14 w-14 place-items-center rounded-full bg-white text-2xl font-black ring-2 ring-amber-400 ${
                drag?.itemId === id ? "opacity-40" : ""
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {TARGETS.map((i) => {
          const count = Object.values(drops).filter((v) => v === i).length;
          const isHover = hover === i;
          return (
            <div
              key={i}
              ref={(el) => {
                targetRefs.current[i] = el;
              }}
              data-dnd-target={i}
              className={`grid h-32 place-items-center rounded-2xl text-center font-black transition-all ${
                isHover
                  ? "bg-emerald-100 ring-4 ring-emerald-500 scale-105"
                  : "bg-white ring-2 ring-slate-300"
              }`}
            >
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500">Target</div>
                <div className="text-2xl">#{i}</div>
                <div className="text-sm text-slate-600">count: {count}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-slate-900 p-3 font-mono text-[10px] leading-tight text-emerald-300 ring-1 ring-slate-700">
        <div className="mb-2 flex items-center justify-between text-emerald-200">
          <span>
            drag={drag ? `item#${drag.itemId} ptr=${drag.pointerId} @(${Math.round(drag.x)},${Math.round(drag.y)})` : "—"}
          </span>
          <span>hover={hover === null ? "—" : `#${hover}`}</span>
        </div>
        <div className="max-h-64 overflow-auto">
          {log.length === 0 && <div className="text-slate-500">No events yet. Press on a pool item.</div>}
          {log.map((s, i) => (
            <div key={i} className="border-b border-slate-800 py-0.5">
              <span className="text-amber-300">{s.type}</span>
              {s.pointerType && <span className="text-slate-400"> {s.pointerType}#{s.pointerId}</span>}
              <span className="text-cyan-300"> ({Math.round(s.x)},{Math.round(s.y)})</span>
              {s.buttons !== undefined && <span className="text-slate-400"> btn={s.buttons}</span>}
              {s.captured !== undefined && (
                <span className={s.captured ? "text-emerald-400" : "text-rose-400"}> cap={String(s.captured)}</span>
              )}
              <span className="text-slate-500"> under={s.target}</span>
              <span className={s.hit === null ? "text-rose-400" : "text-emerald-400"}> hit={s.hit ?? "MISS"}</span>
            </div>
          ))}
        </div>
      </div>

      {drag && (
        <div
          className="pointer-events-none fixed z-50 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-amber-400 text-xl font-black ring-2 ring-amber-700"
          style={{ left: drag.x, top: drag.y }}
        >
          {drag.itemId}
        </div>
      )}
    </div>
  );
}
