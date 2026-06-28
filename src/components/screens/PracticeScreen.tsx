import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BigButton } from "@/components/BigButton";
import { SprunkiAvatar } from "@/components/SprunkiAvatar";
import { CountingBeads } from "@/components/CountingBeads";
import { fireConfetti } from "@/components/ConfettiBurst";
import { generateProblem, operationSymbol, pickOperation } from "@/lib/problems";
import { EqualGroupsVisual } from "@/components/EqualGroupsVisual";
import { SharingVisual } from "@/components/SharingVisual";
import { sound } from "@/lib/sound";
import { music } from "@/lib/music";
import type { UseGameState } from "@/hooks/useGameState";
import type { Problem, Sprunki } from "@/types";
import type { Screen } from "@/components/MathQuestApp";

interface Props {
  game: UseGameState;
  go: (s: Screen) => void;
}

function pickGuide(list: Sprunki[]): Sprunki {
  return list[Math.floor(Math.random() * list.length)];
}

export function PracticeScreen({ game, go }: Props) {
  const { state, unlockedSprunkies, recordAnswer, markSelected } = game;
  const ops = state.settings.operations?.length ? state.settings.operations : ["addition" as const];
  const multSolvedRef = useRef(state.multiplicationSolved);
  const divSolvedRef = useRef(state.divisionSolved);
  useEffect(() => {
    multSolvedRef.current = state.multiplicationSolved;
  }, [state.multiplicationSolved]);
  useEffect(() => {
    divSolvedRef.current = state.divisionSolved;
  }, [state.divisionSolved]);
  const makeProblem = useCallback(
    (op = pickOperation(ops)) =>
      generateProblem({
        operation: op,
        multiplicationSolved: multSolvedRef.current,
        divisionSolved: divSolvedRef.current,
      }),
    [ops],
  );
  const [problem, setProblem] = useState<Problem>(() => makeProblem());
  const [guide, setGuide] = useState<Sprunki>(() => pickGuide(unlockedSprunkies));
  const [phrase, setPhrase] = useState<string>("");
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [levelUp, setLevelUp] = useState<{ level: number; unlocked?: Sprunki } | null>(null);
  const [showBeads, setShowBeads] = useState<boolean>(true);
  const cardControls = useAnimationControls();
  const advanceTimer = useRef<number | null>(null);

  const sfxOn = state.settings.sfx;

  const setupNext = useCallback(() => {
    const next = pickGuide(unlockedSprunkies);
    setGuide(next);
    markSelected(next.id);
    setProblem(makeProblem());
    setSelected(null);
    setStatus("idle");
  }, [unlockedSprunkies, markSelected, makeProblem]);

  useEffect(() => {
    // initial select count for first guide
    markSelected(guide.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { if (advanceTimer.current) window.clearTimeout(advanceTimer.current); }, []);

  // Swap background music to the current guide's loop
  useEffect(() => {
    if (state.settings.music && !state.settings.muted) {
      music.play(guide.icon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide.icon]);

  const onAnswer = (choice: number) => {
    if (status === "correct") return;
    setSelected(choice);
    const correct = choice === problem.answer;
    if (correct) {
      if (sfxOn) sound.correct();
      setStatus("correct");
      const result = recordAnswer(true, guide.id, problem.operation);
      setPhrase(guide.catchPhrases[Math.floor(Math.random() * guide.catchPhrases.length)]);
      fireConfetti("small");
      const advanceDelay = problem.operation === "multiplication" ? 2200 : 1100;
      if (result.leveledUp) {
        if (sfxOn) {
          setTimeout(() => sound.levelUp(), 250);
          if (result.unlocked) setTimeout(() => sound.unlock(), 700);
        }
        setLevelUp({ level: result.newLevel, unlocked: result.unlocked });
      } else {
        advanceTimer.current = window.setTimeout(setupNext, advanceDelay);
      }
    } else {
      if (sfxOn) sound.wrong();
      setStatus("wrong");
      recordAnswer(false, guide.id, problem.operation);
      cardControls.start({ x: [0, -14, 14, -10, 10, -4, 0], transition: { duration: 0.5 } });
      window.setTimeout(() => setStatus("idle"), 600);
    }
  };

  const dismissLevelUp = () => {
    setLevelUp(null);
    setupNext();
  };

  const xpIntoLevel = state.xp % game.XP_PER_LEVEL;
  const pct = (xpIntoLevel / game.XP_PER_LEVEL) * 100;

  const choices = useMemo(() => problem.choices, [problem]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <header className="flex items-center justify-between gap-2 pr-14 sm:pr-0">
        <button
          onClick={() => go("home")}
          className="rounded-full bg-card px-3 py-2 text-xs font-bold ring-1 ring-border shadow-sm hover:bg-accent sm:px-4 sm:text-sm"
          aria-label="Back to home"
        >
          ← Home
        </button>
        <div className="flex items-center gap-2 text-xs font-bold sm:gap-3 sm:text-sm">
          <span className="rounded-full bg-card px-2.5 py-1 ring-1 ring-border sm:px-3">⭐ Lv {state.level}</span>
          <span className="rounded-full bg-card px-2.5 py-1 ring-1 ring-border sm:px-3">🔥 {state.streak}</span>
        </div>
      </header>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted sm:h-3">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[oklch(0.78_0.18_140)] to-[oklch(0.72_0.2_200)]"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <motion.div
        animate={cardControls}
        className="relative grid items-center gap-4 rounded-3xl bg-card p-4 shadow-md ring-1 ring-border/60 sm:grid-cols-[auto_1fr] sm:gap-10 sm:rounded-[2rem] sm:p-10"
      >
        <div className="grid place-items-center">
          <div className="sm:hidden">
            <SprunkiAvatar sprunki={guide} size={110} bouncing={status === "correct"} idle={status !== "correct"} />
          </div>
          <div className="hidden sm:block">
            <SprunkiAvatar sprunki={guide} size={170} bouncing={status === "correct"} idle={status !== "correct"} />
          </div>
          <AnimatePresence>
            {status === "correct" && (
              <motion.div
                key={phrase}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 rounded-full bg-[oklch(0.95_0.05_140)] px-4 py-1 text-sm font-bold text-[oklch(0.4_0.15_150)] ring-1 ring-[oklch(0.78_0.14_150)]/40"
              >
                {phrase}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground sm:text-left sm:text-sm">
            {problem.operation === "multiplication"
              ? status === "correct"
                ? "You got it!"
                : "Count the groups"
              : "Solve the problem"}
          </p>

          {problem.operation === "multiplication" ? (
            <>
              {/* Equation is hidden until the child answers, so they discover it via the visual. */}
              <AnimatePresence mode="wait">
                {status === "correct" ? (
                  <motion.div
                    key="eq-revealed"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="text-center text-[clamp(2rem,9vw,4.5rem)] font-black leading-none tracking-tight sm:text-left"
                  >
                    <span className="tabular-nums">{problem.a}</span>{" "}
                    <span className="text-muted-foreground">×</span>{" "}
                    <span className="tabular-nums">{problem.b}</span>{" "}
                    <span className="text-muted-foreground">=</span>{" "}
                    <span className="tabular-nums text-[oklch(0.55_0.2_150)]">{problem.answer}</span>
                  </motion.div>
                ) : (
                  <motion.p
                    key="eq-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-xl font-black sm:text-left sm:text-2xl"
                  >
                    {problem.a} groups of {problem.b} — how many altogether?
                  </motion.p>
                )}
              </AnimatePresence>
              <EqualGroupsVisual
                groups={problem.a}
                perGroup={problem.b}
                guide={guide}
                solved={status === "correct"}
              />
            </>
          ) : (
            <>
              <div className="text-center text-[clamp(2.5rem,12vw,6rem)] font-black leading-none tracking-tight sm:text-left">
                <span className="tabular-nums">{problem.a}</span>{" "}
                <span className="text-muted-foreground">{operationSymbol[problem.operation]}</span>{" "}
                <span className="tabular-nums">{problem.b}</span>{" "}
                <span className="text-muted-foreground">=</span>{" "}
                <span className="text-muted-foreground/70">?</span>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowBeads((v) => !v)}
                  className="rounded-full bg-card px-4 py-2 text-xs font-bold ring-1 ring-border shadow-sm hover:bg-accent"
                  aria-pressed={showBeads}
                >
                  {showBeads ? "🧮 Hide beads" : "🧮 Show beads"}
                </button>
              </div>

              <AnimatePresence initial={false}>
                {showBeads && (
                  <motion.div
                    key="beads"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <CountingBeads a={problem.a} b={problem.b} operation={problem.operation} solved={status === "correct"} guideIcon={guide.icon} />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}


          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {choices.map((choice) => {
              const isSelected = selected === choice;
              const isCorrect = status === "correct" && choice === problem.answer;
              const isWrong = status === "wrong" && isSelected;
              return (
                <motion.button
                  key={choice}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onAnswer(choice)}
                  disabled={status === "correct"}
                  style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                  className={[
                    "relative h-16 select-none rounded-2xl text-2xl font-black tabular-nums sm:h-24 sm:rounded-3xl sm:text-4xl",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[oklch(0.78_0.18_240)]/40",
                    isCorrect
                      ? "bg-gradient-to-b from-[oklch(0.86_0.18_145)] to-[oklch(0.66_0.22_150)] text-white shadow-[0_8px_0_oklch(0.46_0.18_150)]"
                      : isWrong
                        ? "bg-gradient-to-b from-[oklch(0.86_0.16_30)] to-[oklch(0.62_0.22_28)] text-white shadow-[0_8px_0_oklch(0.45_0.2_28)]"
                        : "bg-gradient-to-b from-white to-[oklch(0.96_0.02_260)] text-foreground shadow-[0_8px_0_oklch(0.86_0.02_260)] ring-1 ring-border hover:from-[oklch(0.98_0.02_240)] active:translate-y-[3px] active:shadow-[0_4px_0_oklch(0.86_0.02_260)]",
                  ].join(" ")}
                  aria-label={`Answer ${choice}`}
                >
                  {choice}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {levelUp && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissLevelUp}
          >
            <motion.div
              initial={{ scale: 0.6, y: 40, rotate: -4 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="w-full max-w-md rounded-[2rem] bg-card p-8 text-center shadow-2xl ring-1 ring-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl">🎉</div>
              <h3 className="mt-3 text-3xl font-black">Level {levelUp.level}!</h3>
              <p className="mt-2 text-muted-foreground">You're getting stronger at math.</p>
              {levelUp.unlocked && (
                <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl bg-accent p-5">
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    New friend unlocked!
                  </p>
                  <SprunkiAvatar sprunki={levelUp.unlocked} size={120} bouncing />
                  <p className="text-xl font-black">{levelUp.unlocked.name}</p>
                  <p className="text-sm text-muted-foreground">{levelUp.unlocked.personality}</p>
                </div>
              )}
              <div className="mt-6">
                <BigButton onClick={dismissLevelUp} size="lg" icon="▶">
                  Keep playing
                </BigButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
