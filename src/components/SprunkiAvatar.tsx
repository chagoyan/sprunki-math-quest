import { motion } from "framer-motion";
import type { Sprunki } from "@/types";
import { cn } from "@/lib/utils";
import { getSprunkiFullUrl, getSprunkiIconUrl } from "@/lib/sprunkiAssets";

interface Props {
  sprunki: Sprunki;
  size?: number;
  locked?: boolean;
  idle?: boolean;
  bouncing?: boolean;
  className?: string;
  /** Use the small badge icon instead of the full character art. */
  variant?: "full" | "icon";
}

export function SprunkiAvatar({
  sprunki,
  size = 96,
  locked,
  idle,
  bouncing,
  className,
  variant = "full",
}: Props) {
  const imgUrl =
    variant === "icon"
      ? getSprunkiIconUrl(sprunki.icon)
      : getSprunkiFullUrl(sprunki.icon);
  const color = sprunki.color;

  return (
    <motion.div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      animate={
        bouncing
          ? { y: [0, -14, 0, -6, 0], rotate: [0, -4, 4, -2, 0] }
          : idle
            ? { y: [0, -4, 0], rotate: [-1.5, 1.5, -1.5] }
            : undefined
      }
      transition={
        bouncing
          ? { duration: 0.9, ease: "easeOut" }
          : idle
            ? { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
            : undefined
      }
    >
      {/* squish shadow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/15 blur-md"
        style={{ width: size * 0.7, height: size * 0.12 }}
      />
      {imgUrl && !locked ? (
        <img
          src={imgUrl}
          alt={sprunki.name}
          draggable={false}
          className="relative select-none"
          style={{
            width: size,
            height: size,
            objectFit: "contain",
            filter: `drop-shadow(0 10px 14px ${color}55)`,
          }}
        />
      ) : (
        <div
          className="relative grid place-items-center overflow-hidden rounded-[38%] shadow-lg"
          style={{
            width: size,
            height: size,
            background: locked
              ? "linear-gradient(160deg, #cbd5e1, #94a3b8)"
              : `radial-gradient(circle at 30% 25%, color-mix(in oklab, ${color} 92%, white 30%), ${color} 65%, color-mix(in oklab, ${color} 70%, black 22%))`,
            boxShadow: locked
              ? "0 8px 18px -8px rgba(0,0,0,0.25), inset 0 -6px 0 rgba(0,0,0,0.15)"
              : `0 12px 26px -10px ${color}88, inset 0 -10px 0 rgba(0,0,0,0.18), inset 0 4px 0 rgba(255,255,255,0.35)`,
          }}
        >
          {locked && (
            <div className="absolute inset-0 grid place-items-center text-4xl">🔒</div>
          )}
          {!locked && (
            <span
              className="font-black text-white/95 drop-shadow"
              style={{ fontSize: size * 0.4 }}
            >
              {sprunki.name.replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
