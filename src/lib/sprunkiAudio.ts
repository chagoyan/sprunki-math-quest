// Auto-wired Sprunki audio loops (CDN-hosted)
import brud_1 from "@/assets/sprunki-audio/brud_1.wav.asset.json";
import clukr_1 from "@/assets/sprunki-audio/clukr_1.wav.asset.json";
import durple_1 from "@/assets/sprunki-audio/durple_1.wav.asset.json";
import durple_2 from "@/assets/sprunki-audio/durple_2.wav.asset.json";
import funbot_1 from "@/assets/sprunki-audio/funbot_1.mp3.asset.json";
import garnold_1 from "@/assets/sprunki-audio/garnold_1.wav.asset.json";
import gray_1 from "@/assets/sprunki-audio/gray_1.wav.asset.json";
import gray_2 from "@/assets/sprunki-audio/gray_2.wav.asset.json";
import jevin_1 from "@/assets/sprunki-audio/jevin_1.wav.asset.json";
import jevin_2 from "@/assets/sprunki-audio/jevin_2.wav.asset.json";
import mrfuncomputer_1 from "@/assets/sprunki-audio/mrfuncomputer_1.wav.asset.json";
import mrfuncomputer_2 from "@/assets/sprunki-audio/mrfuncomputer_2.wav.asset.json";
import mrsun_1 from "@/assets/sprunki-audio/mrsun_1.wav.asset.json";
import mrsun_2 from "@/assets/sprunki-audio/mrsun_2.wav.asset.json";
import mrtree_1 from "@/assets/sprunki-audio/mrtree_1.wav.asset.json";
import mrtree_2 from "@/assets/sprunki-audio/mrtree_2.wav.asset.json";
import oren_1 from "@/assets/sprunki-audio/oren_1.wav.asset.json";
import owakcx_1 from "@/assets/sprunki-audio/owakcx_1.wav.asset.json";
import owakcx_2 from "@/assets/sprunki-audio/owakcx_2.wav.asset.json";
import pinki_1 from "@/assets/sprunki-audio/pinki_1.wav.asset.json";
import pinki_2 from "@/assets/sprunki-audio/pinki_2.wav.asset.json";
import raddy_1 from "@/assets/sprunki-audio/raddy_1.wav.asset.json";
import simon_1 from "@/assets/sprunki-audio/simon_1.wav.asset.json";
import simon_2 from "@/assets/sprunki-audio/simon_2.wav.asset.json";
import sky_1 from "@/assets/sprunki-audio/sky_1.wav.asset.json";
import sky_2 from "@/assets/sprunki-audio/sky_2.wav.asset.json";
import tunner_1 from "@/assets/sprunki-audio/tunner_1.wav.asset.json";
import tunner_2 from "@/assets/sprunki-audio/tunner_2.wav.asset.json";
import vineria_1 from "@/assets/sprunki-audio/vineria_1.wav.asset.json";
import wenda_1 from "@/assets/sprunki-audio/wenda_1.wav.asset.json";

type AssetRef = { url: string };

// Map of character key -> list of loop URLs
const TRACKS: Record<string, AssetRef[]> = {
  brud: [brud_1],
  clukr: [clukr_1],
  durple: [durple_1, durple_2],
  funbot: [funbot_1],
  garnold: [garnold_1],
  gray: [gray_1, gray_2],
  jevin: [jevin_1, jevin_2],
  mrfuncomputer: [mrfuncomputer_1, mrfuncomputer_2],
  mrsun: [mrsun_1, mrsun_2],
  mrtree: [mrtree_1, mrtree_2],
  oren: [oren_1],
  owakcx: [owakcx_1, owakcx_2],
  pinki: [pinki_1, pinki_2],
  raddy: [raddy_1],
  simon: [simon_1, simon_2],
  sky: [sky_1, sky_2],
  tunner: [tunner_1, tunner_2],
  vineria: [vineria_1],
  wenda: [wenda_1],
};

const baseName = (icon: string) => icon.replace(/\.[a-z0-9]+$/i, "").toLowerCase();

export function getSprunkiAudioUrls(icon: string): string[] {
  return (TRACKS[baseName(icon)] ?? []).map((t) => t.url);
}

export function getRandomSprunkiAudioUrl(icon?: string): string | undefined {
  if (icon) {
    const urls = getSprunkiAudioUrls(icon);
    if (urls.length) return urls[Math.floor(Math.random() * urls.length)];
  }
  const all = Object.values(TRACKS).flat();
  return all[Math.floor(Math.random() * all.length)]?.url;
}

/** Returns the first (shorter) track URL for a character. */
export function getFirstSprunkiAudioUrl(icon: string): string | undefined {
  const urls = TRACKS[baseName(icon)] ?? [];
  return urls[0]?.url;
}

/** Returns the second (longer) track URL for a character, or the first if only one exists. */
export function getLongerSprunkiAudioUrl(icon: string): string | undefined {
  const urls = TRACKS[baseName(icon)] ?? [];
  return urls[1]?.url ?? urls[0]?.url;
}

/** Returns every Sprunki audio URL across all characters. */
export function getAllSprunkiAudioUrls(): string[] {
  return Object.values(TRACKS).flatMap((arr) => arr.map((t) => t.url));
}
