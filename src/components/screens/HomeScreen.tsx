import { motion } from "framer-motion";
import { BigButton } from "@/components/BigButton";
import { SprunkiAvatar } from "@/components/SprunkiAvatar";
import { StatsBar } from "@/components/StatsBar";
import type { UseGameState } from "@/hooks/useGameState";
import type { Screen } from "@/components/MathQuestApp";
import type { Operation } from "@/types";

interface Props {
  game: UseGameState;
  go: (s: Screen) => void;
}

const OP_OPTIONS: { op: Operation; label: string; symbol: string }[] = [
  { op: "addition", label: "Addition", symbol: "+" },
  { op: "subtraction", label: "Subtraction", symbol: "−" },
  { op: "multiplication", label: "Multiplication", symbol: "×" },
  { op: "division", label: "Division", symbol: "÷" },
];

export function HomeScreen({ game, go }: Props) {
  const featured = game.unlockedSprunkies[0] ?? game.unlockedSprunkies[0];
  const selectedOps = game.state.settings.operations ?? ["addition"];
  const toggleOp = (op: Operation) => {
    const has = selectedOps.includes(op);
    const next = has ? selectedOps.filter((o) => o !== op) : [...selectedOps, op];
    game.updateSettings({ operations: next.length ? next : ["addition"] });
  };
  const canPlay = selectedOps.length > 0;
  const featured = game.unlockedSprunkies[0] ?? game.unlockedSprunkies[0];
  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black tracking-tight sm:text-5xl"
        >
          <span className="bg-gradient-to-r from-[oklch(0.7_0.2_30)] via-[oklch(0.72_0.2_140)] to-[oklch(0.7_0.2_260)] bg-clip-text text-transparent">
            Math
          </span>
          <span className="text-foreground">Quest</span>
        </motion.h1>
        <button
          onClick={() => go("parent")}
          aria-label="Parent area"
          className="rounded-full bg-card px-4 py-2 text-sm font-bold ring-1 ring-border shadow-sm hover:bg-accent"
        >
          👤 Parent
        </button>
      </header>

      <StatsBar state={game.state} xpPerLevel={game.XP_PER_LEVEL} />

      <div className="grid items-center gap-6 rounded-[2rem] bg-card p-6 shadow-sm ring-1 ring-border/60 sm:grid-cols-[1fr_auto] sm:gap-10 sm:p-10">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Today's guide
          </p>
          <h2 className="text-3xl font-black sm:text-4xl">
            Hi! I'm {featured?.name ?? "your guide"} 👋
          </h2>
          <p className="text-lg text-muted-foreground">
            Ready to solve some math and unlock new friends?
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <BigButton size="xl" icon="▶" onClick={() => go("practice")}>
              Play
            </BigButton>
            <BigButton variant="secondary" icon="✨" onClick={() => go("collection")}>
              Collection
            </BigButton>
            <BigButton variant="ghost" icon="⚙️" onClick={() => go("settings")}>
              Settings
            </BigButton>
          </div>
        </div>
        <div className="grid place-items-center">
          {featured && <SprunkiAvatar sprunki={featured} size={200} idle />}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Collected {game.unlockedSprunkies.length} / {game.unlockedSprunkies.length + game.lockedSprunkies.length} Sprunkies
        </span>
        <span>Best streak: {game.state.bestStreak} 🔥</span>
      </div>
    </div>
  );
}
