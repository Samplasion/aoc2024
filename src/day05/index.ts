import run, { getTests } from "../deps.ts";

type Rule = [number, number];
type Update = number[];
type Input = {
  rules: Rule[];
  updates: Update[];
}

const parseInput = (rawInput: string) => {
  const [rulesRaw, updatesRaw] = rawInput.trim().split("\n\n");
  const rules = rulesRaw.split("\n").map((rule) => rule.split("|").map(Number) as Rule);
  const updates = updatesRaw.split("\n").map((update) => update.split(",").map(Number));

  return { rules, updates };
};

const _bothParts = (rawInput: string) => {
  const input = parseInput(rawInput);
  const graph = new Map<number, number[]>();

  for (const [from, to] of input.rules) {
    if (!graph.has(from)) {
      graph.set(from, []);
    }
    graph.get(from)!.push(to);
  }

  for (const [_, to] of input.rules) {
    if (!graph.has(to)) {
      graph.set(to, []);
    }
  }

  const wrongUpdates: Update[] = [];
  
  let sum = 0;
  for (const update of input.updates) {
    if (_updateValid(graph, update)) {
      sum += update[(update.length - 1) / 2];
    } else {
      wrongUpdates.push(update);
    }
  }

  let part2Sum = 0;
  for (const update of wrongUpdates) {
    const copy = update.sort((a, b) => {
      if (graph.get(a)?.includes(b)) {
        return 1;
      }
      return -1;
    });
    part2Sum += copy[(copy.length - 1) / 2];
  }
  
  return [sum, part2Sum];
}

function _updateValid(graph: Map<number, number[]>, update: Update): boolean {
  for (let i = 0; i < update.length; i++) {
    const page = update[i];

    const nextPages = update.slice(i + 1);
    if (!nextPages.every((nextPage) => graph.get(page)!.includes(nextPage))) {
      return false;
    }
  }

  return true;
}

const part1 = (rawInput: string) => {
  return _bothParts(rawInput)[0];
};

const part2 = (rawInput: string) => {
  return _bothParts(rawInput)[1];
};

run({
  part1: {
    tests: [
      {
        input: await getTests(),
        expected: 143,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: await getTests(),
        expected: 123,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});