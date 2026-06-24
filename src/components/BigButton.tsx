import { motion } from "framer-motion";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  size?: "md" | "lg" | "xl";
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-[oklch(0.82_0.18_150)] to-[oklch(0.66_0.22_150)] text-white shadow-[0_8px_0_oklch(0.46_0.18_150)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_4px_0_oklch(0.46_0.18_150)]",
  secondary:
    "bg-gradient-to-b from-[oklch(0.86_0.14_240)] to-[oklch(0.7_0.18_245)] text-white shadow-[0_8px_0_oklch(0.5_0.16_250)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_4px_0_oklch(0.5_0.16_250)]",
  ghost:
    "bg-card text-foreground shadow-[0_6px_0_oklch(0.86_0.02_260)] ring-1 ring-border hover:bg-accent active:translate-y-[2px] active:shadow-[0_3px_0_oklch(0.86_0.02_260)]",
  danger:
    "bg-gradient-to-b from-[oklch(0.82_0.17_30)] to-[oklch(0.62_0.22_28)] text-white shadow-[0_8px_0_oklch(0.45_0.2_28)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_4px_0_oklch(0.45_0.2_28)]",
};

const sizes = {
  md: "h-12 px-5 text-base",
  lg: "h-16 px-7 text-xl",
  xl: "h-20 px-10 text-2xl",
};

export const BigButton = forwardRef<HTMLButtonElement, Props>(function BigButton(
  { variant = "primary", size = "lg", icon, className, children, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "inline-flex select-none items-center justify-center gap-3 rounded-3xl font-black tracking-wide transition-all",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[oklch(0.78_0.18_240)]/40 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...(rest as unknown as Record<string, never>)}
    >
      {icon && <span className="text-2xl leading-none" aria-hidden>{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
});
