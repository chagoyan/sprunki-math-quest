/*
 * Mixer: independently loop multiple Sprunki tracks at once.
 * Each sprunki has its own looping HTMLAudioElement.
 */
import { getLongerSprunkiAudioUrl, getFirstSprunkiAudioUrl } from "./sprunkiAudio";

type Listener = (active: Set<string>) => void;

const elements = new Map<number, HTMLAudioElement>();
const active = new Set<number>();
const listeners = new Set<Listener>();
let muted = false;

function emit() {
  const snapshot = new Set(active);
  listeners.forEach((l) => l(snapshot));
}

function getEl(id: string, url: string): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  let el = elements.get(id);
  if (!el) {
    el = new Audio(url);
    el.loop = true;
    el.volume = 0.5;
    el.preload = "auto";
    elements.set(id, el);
  } else if (el.src !== url) {
    el.src = url;
  }
  return el;
}

export const mixer = {
  isActive(id: string) {
    return active.has(id);
  },

  toggle(id: string, icon: string) {
    if (active.has(id)) {
      this.stop(id);
    } else {
      this.start(id, icon);
    }
  },

  start(id: string, icon: string) {
    const url = getLongerSprunkiAudioUrl(icon);
    if (!url) return;
    const el = getEl(id, url);
    if (!el) return;
    active.add(id);
    if (!muted) void el.play().catch(() => {});
    emit();
  },

  stop(id: string) {
    const el = elements.get(id);
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    active.delete(id);
    emit();
  },

  /** Play the character's accent (second/shorter) sound once, layered on top. */
  accent(icon: string) {
    if (muted || typeof window === "undefined") return;
    const url = getFirstSprunkiAudioUrl(icon);
    if (!url) return;
    const el = new Audio(url);
    el.volume = 0.6;
    void el.play().catch(() => {});
  },

  reset() {
    for (const id of Array.from(active)) this.stop(id);
  },

  setMuted(m: boolean) {
    muted = m;
    for (const id of active) {
      const el = elements.get(id);
      if (!el) continue;
      if (m) el.pause();
      else void el.play().catch(() => {});
    }
  },

  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    fn(new Set(active));
    return () => {
      listeners.delete(fn);
    };
  },
};
