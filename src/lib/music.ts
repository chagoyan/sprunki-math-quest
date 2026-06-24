/*
 * Background music player: loops a Sprunki character audio track.
 * Use music.play(icon?) to swap to a specific character's loop,
 * music.start() to (re)start the current/random loop,
 * music.stop() to pause, music.setMuted() to mute.
 */
import { getRandomSprunkiAudioUrl } from "./sprunkiAudio";

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

  /** Play a specific character's loop. */
  play(icon?: string) {
    const url = getRandomSprunkiAudioUrl(icon);
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
};
