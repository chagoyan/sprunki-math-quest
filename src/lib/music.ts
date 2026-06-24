/*
 * Background music player: loops a Sprunki character audio track.
 * Use music.play(icon?) to swap to a specific character's loop,
 * music.start() to (re)start the current/random loop,
 * music.stop() to pause, music.setMuted() to mute.
 */
import { getRandomSprunkiAudioUrl, getLongerSprunkiAudioUrl, getAllSprunkiAudioUrls } from "./sprunkiAudio";

const preloaded = new Map<string, HTMLAudioElement>();
let preloadStarted = false;

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

  /** Play a one-shot sound effect without interrupting the background loop. */
  playEffect(url: string) {
    if (muted || typeof window === "undefined") return;
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
      if (preloaded.has(url)) continue;
      const el = new Audio();
      el.preload = "auto";
      el.src = url;
      // Kick off the network fetch.
      try { el.load(); } catch { /* noop */ }
      preloaded.set(url, el);
    }
  },
};
