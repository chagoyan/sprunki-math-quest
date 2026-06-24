// Auto-wired Sprunki image assets (CDN-hosted SVGs)
import black_icon from "@/assets/sprunki-icons/black.svg.asset.json";
import brud_icon from "@/assets/sprunki-icons/brud.svg.asset.json";
import clukr_icon from "@/assets/sprunki-icons/clukr.svg.asset.json";
import durple_icon from "@/assets/sprunki-icons/durple.svg.asset.json";
import funbot_icon from "@/assets/sprunki-icons/funbot.svg.asset.json";
import garnold_icon from "@/assets/sprunki-icons/garnold.svg.asset.json";
import gray_icon from "@/assets/sprunki-icons/gray.svg.asset.json";
import jevin_icon from "@/assets/sprunki-icons/jevin.svg.asset.json";
import mrfuncomputer_icon from "@/assets/sprunki-icons/mrfuncomputer.svg.asset.json";
import mrsun_icon from "@/assets/sprunki-icons/mrsun.svg.asset.json";
import mrtree_icon from "@/assets/sprunki-icons/mrtree.svg.asset.json";
import oren_icon from "@/assets/sprunki-icons/oren.svg.asset.json";
import owakcx_icon from "@/assets/sprunki-icons/owakcx.svg.asset.json";
import pinki_icon from "@/assets/sprunki-icons/pinki.svg.asset.json";
import raddy_icon from "@/assets/sprunki-icons/raddy.svg.asset.json";
import simon_icon from "@/assets/sprunki-icons/simon.svg.asset.json";
import sky_icon from "@/assets/sprunki-icons/sky.svg.asset.json";
import tunner_icon from "@/assets/sprunki-icons/tunner.svg.asset.json";
import vineria_icon from "@/assets/sprunki-icons/vineria.svg.asset.json";
import wenda_icon from "@/assets/sprunki-icons/wenda.svg.asset.json";

import black_full from "@/assets/sprunki-full/black.svg.asset.json";
import brud_full from "@/assets/sprunki-full/brud.svg.asset.json";
import clukr_full from "@/assets/sprunki-full/clukr.svg.asset.json";
import durple_full from "@/assets/sprunki-full/durple.svg.asset.json";
import funbot_full from "@/assets/sprunki-full/funbot.svg.asset.json";
import garnold_full from "@/assets/sprunki-full/garnold.svg.asset.json";
import gray_full from "@/assets/sprunki-full/gray.svg.asset.json";
import jevin_full from "@/assets/sprunki-full/jevin.svg.asset.json";
import mrfuncomputer_full from "@/assets/sprunki-full/mrfuncomputer.svg.asset.json";
import mrsun_full from "@/assets/sprunki-full/mrsun.svg.asset.json";
import mrtree_full from "@/assets/sprunki-full/mrtree.svg.asset.json";
import oren_full from "@/assets/sprunki-full/oren.svg.asset.json";
import owakcx_full from "@/assets/sprunki-full/owakcx.svg.asset.json";
import pinki_full from "@/assets/sprunki-full/pinki.svg.asset.json";
import raddy_full from "@/assets/sprunki-full/raddy.svg.asset.json";
import simon_full from "@/assets/sprunki-full/simon.svg.asset.json";
import sky_full from "@/assets/sprunki-full/sky.svg.asset.json";
import tunner_full from "@/assets/sprunki-full/tunner.svg.asset.json";
import vineria_full from "@/assets/sprunki-full/vineria.svg.asset.json";
import wenda_full from "@/assets/sprunki-full/wenda.svg.asset.json";

type AssetRef = { url: string };

const ICONS: Record<string, AssetRef> = {
  black: black_icon, brud: brud_icon, clukr: clukr_icon, durple: durple_icon,
  funbot: funbot_icon, garnold: garnold_icon, gray: gray_icon, jevin: jevin_icon,
  mrfuncomputer: mrfuncomputer_icon, mrsun: mrsun_icon, mrtree: mrtree_icon,
  oren: oren_icon, owakcx: owakcx_icon, pinki: pinki_icon, raddy: raddy_icon,
  simon: simon_icon, sky: sky_icon, tunner: tunner_icon, vineria: vineria_icon,
  wenda: wenda_icon,
};

const FULL: Record<string, AssetRef> = {
  black: black_full, brud: brud_full, clukr: clukr_full, durple: durple_full,
  funbot: funbot_full, garnold: garnold_full, gray: gray_full, jevin: jevin_full,
  mrfuncomputer: mrfuncomputer_full, mrsun: mrsun_full, mrtree: mrtree_full,
  oren: oren_full, owakcx: owakcx_full, pinki: pinki_full, raddy: raddy_full,
  simon: simon_full, sky: sky_full,
};

const baseName = (icon: string) => icon.replace(/\.[a-z0-9]+$/i, "").toLowerCase();

export function getSprunkiIconUrl(icon: string): string | undefined {
  return ICONS[baseName(icon)]?.url;
}

export function getSprunkiFullUrl(icon: string): string | undefined {
  const key = baseName(icon);
  return FULL[key]?.url ?? ICONS[key]?.url;
}
