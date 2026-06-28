import type { Operation, Problem } from "@/types";

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export interface ProblemConfig {
  operation: Operation;
  min?: number;
  max?: number;
  /** For multiplication: how many the child has solved so far. Drives difficulty progression. */
  multiplicationSolved?: number;
  /** For division: how many the child has solved so far. */
  divisionSolved?: number;
}

// Progressive pools of [groups, perGroup] pairs for multiplication.
// Start tiny, build mathematical intuition before introducing larger values.
const MULT_STAGES: Array<Array<[number, number]>> = [
  // Stage 0 (first ~10 problems): the absolute basics
  [[2, 2], [2, 3], [3, 2], [2, 4], [4, 2]],
  // Stage 1 (~10–25): add 3-based groups
  [[2, 2], [2, 3], [3, 2], [2, 4], [4, 2], [3, 3], [2, 5], [5, 2], [3, 4], [4, 3]],
  // Stage 2 (~25–50): up to 4×4
  [[2, 3], [3, 2], [2, 4], [4, 2], [3, 3], [3, 4], [4, 3], [2, 5], [5, 2], [4, 4], [3, 5], [5, 3]],
  // Stage 3 (50+): up to 5×5
  [[3, 3], [3, 4], [4, 3], [4, 4], [3, 5], [5, 3], [4, 5], [5, 4], [5, 5], [2, 5], [5, 2]],
];

function pickMultPair(solved: number): [number, number] {
  const stage = solved < 10 ? 0 : solved < 25 ? 1 : solved < 50 ? 2 : 3;
  const pool = MULT_STAGES[stage];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Sharing-equally model: [total, groups]. All have whole-number quotients, no remainders.
const DIV_STAGES: Array<Array<[number, number]>> = [
  // Stage 0 (first ~10): very small, easy to drag
  [[4, 2], [6, 2], [6, 3], [8, 2]],
  // Stage 1 (~10–25): introduce 3-group sharing
  [[4, 2], [6, 2], [6, 3], [8, 2], [9, 3], [10, 2], [12, 3]],
  // Stage 2 (25+): up to 20 / 5
  [[6, 3], [8, 2], [9, 3], [10, 2], [12, 3], [12, 4], [15, 3], [20, 5]],
];

function pickDivPair(solved: number): [number, number] {
  const stage = solved < 10 ? 0 : solved < 25 ? 1 : 2;
  const pool = DIV_STAGES[stage];
  return pool[Math.floor(Math.random() * pool.length)];
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
    case "multiplication": {
      // Equal-groups model: a = number of groups, b = items per group.
      const [groups, perGroup] = pickMultPair(config.multiplicationSolved ?? 0);
      a = groups;
      b = perGroup;
      answer = a * b;
      break;
    }
    case "division": {
      // Sharing-equally model: a = total objects, b = number of groups (Sprunkies).
      const [total, groups] = pickDivPair(config.divisionSolved ?? 0);
      a = total;
      b = groups;
      answer = total / groups;
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
