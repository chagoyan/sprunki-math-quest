import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode } from "react";

interface Props {
  screenKey: string;
  children: ReactNode;
}

export function AppShell({ screenKey, children }: Props) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-background text-foreground">
      {/* playful gradient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[oklch(0.86_0.12_60)] opacity-60 blur-3xl" />
        <div className="absolute -right-24 top-40 h-[380px] w-[380px] rounded-full bg-[oklch(0.86_0.13_200)] opacity-60 blur-3xl" />
        <div className="absolute bottom-[-180px] left-1/3 h-[420px] w-[420px] rounded-full bg-[oklch(0.86_0.13_340)] opacity-55 blur-3xl" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={screenKey}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.99 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
