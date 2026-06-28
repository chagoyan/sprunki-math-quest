import type { Operation, Problem } from "@/types";

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export interface ProblemConfig {
  operation: Operation;
  min?: number;
  max?: number;
}

// Generator is data-driven so subtraction/multiplication/division can be added later.
export function generateProblem(config: ProblemConfig = { operation: "addition" }): Problem {
  const min = config.min ?? 0;
  const max = config.max ?? 10;
  let a = randInt(min, max);
  let b = randInt(min, max);
  let answer = 0;
  switch (config.operation) {
    case "addition":
      answer = a + b;
      break;
    case "subtraction": {
      // Keep result non-negative for young learners
      if (b > a) [a, b] = [b, a];
      answer = a - b;
      break;
    }
    case "multiplication":
      answer = a * b;
      break;
    case "division": {
      // Ensure clean division: pick divisor and quotient, compute dividend
      const divisor = randInt(1, Math.max(1, max));
      const quotient = randInt(min, max);
      a = divisor * quotient;
      b = divisor;
      answer = quotient;
      break;
    }
  }
  return {
    a,
    b,
    operation: config.operation,
    answer,
    choices: buildChoices(answer, min, max, config.operation),
  };
}

export function pickOperation(ops: Operation[]): Operation {
  if (!ops.length) return "addition";
  return ops[Math.floor(Math.random() * ops.length)];
}

function buildChoices(answer: number, min: number, max: number, op: Operation): number[] {
  const ceiling = op === "multiplication" ? max * max : max + max;
  const floor = Math.max(0, min);
  const set = new Set<number>([answer]);
  let guard = 0;
  while (set.size < 4 && guard++ < 50) {
    const delta = randInt(-3, 3);
    const candidate = answer + delta;
    if (candidate >= floor && candidate <= ceiling) set.add(candidate);
  }
  while (set.size < 4) set.add(randInt(floor, ceiling));
  return Array.from(set).sort(() => Math.random() - 0.5);
}

export const operationSymbol: Record<Operation, string> = {
  addition: "+",
  subtraction: "−",
  multiplication: "×",
  division: "÷",
};
