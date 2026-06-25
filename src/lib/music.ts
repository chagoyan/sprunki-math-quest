/*
 * Background music player: loops a Sprunki character audio track.
 * Use music.play(icon?) to swap to a specific character's loop,
 * music.start() to (re)start the current/random loop,
 * music.stop() to pause, music.setMuted() to mute.
 */
import { getRandomSprunkiAudioUrl, getLongerSprunkiAudioUrl, getAllSprunkiAudioUrls } from "./sprunkiAudio";

const preloaded = new Map<string, HTMLAudioElement>();
const buffers = new Map<string, AudioBuffer>();
let preloadStarted = false;
let effectCtx: AudioContext | null = null;

function getEffectCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!effectCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try { effectCtx = new Ctor(); } catch { return null; }
  }
  return effectCtx;
}

async function decodeBuffer(url: string): Promise<AudioBuffer | null> {
  const ctx = getEffectCtx();
  if (!ctx) return null;
  try {
    const res = await fetch(url, { cache: "force-cache" });
    const arr = await res.arrayBuffer();
    const buf = await new Promise<AudioBuffer>((resolve, reject) =>
      ctx.decodeAudioData(arr.slice(0), resolve, reject),
    );
    buffers.set(url, buf);
    return buf;
  } catch {
    return null;
  }
}

let audio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let muted = false;
let wantPlaying = false;

function ensureAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio();
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "auto";
  }
  return audio;
}

function setSrc(url: string) {
  const el = ensureAudio();
  if (!el) return;
  if (currentUrl !== url) {
    currentUrl = url;
    el.src = url;
  }
}

export const music = {
  /** Start (or resume) the background music. Picks a random track if none set. */
  start() {
    const el = ensureAudio();
    if (!el) return;
    wantPlaying = true;
    if (muted) return;
    if (!currentUrl) {
      const url = getRandomSprunkiAudioUrl();
      if (!url) return;
      setSrc(url);
    }
    // Resume the effects context on the same user gesture.
    void getEffectCtx()?.resume().catch(() => {});
    void el.play().catch(() => {
      // Autoplay blocked; will retry after user interaction.
    });
  },

  /** Play a specific character's loop (prefers the longer track). */
  play(icon?: string) {
    const url = icon ? getLongerSprunkiAudioUrl(icon) : getRandomSprunkiAudioUrl();
    if (!url) return;
    setSrc(url);
    this.start();
  },

  /** Swap to a different random track. */
  next() {
    const url = getRandomSprunkiAudioUrl();
    if (!url) return;
    setSrc(url);
    if (wantPlaying && !muted) {
      const el = ensureAudio();
      void el?.play().catch(() => {});
    }
  },

  stop() {
    wantPlaying = false;
    audio?.pause();
  },

  get isPlaying() {
    return !!audio && !audio.paused;
  },

  setMuted(m: boolean) {
    muted = m;
    if (!audio) return;
    if (m) {
      audio.pause();
    } else if (wantPlaying) {
      void audio.play().catch(() => {});
    }
  },

  /** Play a one-shot sound effect with near-zero latency (uses decoded WebAudio buffer if available). */
  playEffect(url: string) {
    if (muted || typeof window === "undefined") return;
    const ctx = getEffectCtx();
    const buf = buffers.get(url);
    if (ctx && buf) {
      try {
        if (ctx.state === "suspended") void ctx.resume();
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.value = 0.4;
        src.connect(gain).connect(ctx.destination);
        src.start();
        return;
      } catch {
        // fall through to HTMLAudio path
      }
    }
    // Lazy decode for next time.
    void decodeBuffer(url);
    const cached = preloaded.get(url);
    const el = cached ? (cached.cloneNode(true) as HTMLAudioElement) : new Audio(url);
    el.volume = 0.35;
    void el.play().catch(() => {});
  },

  /** Preload every Sprunki audio file so playback is instant on first tap. */
  preloadAll() {
    if (preloadStarted || typeof window === "undefined") return;
    preloadStarted = true;
    for (const url of getAllSprunkiAudioUrls()) {
      if (!preloaded.has(url)) {
        const el = new Audio();
        el.preload = "auto";
        el.src = url;
        try { el.load(); } catch { /* noop */ }
        preloaded.set(url, el);
      }
      // Decode into WebAudio buffer for instant one-shot playback.
      if (!buffers.has(url)) void decodeBuffer(url);
    }
  },
};
