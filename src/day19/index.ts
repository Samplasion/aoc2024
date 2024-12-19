import run, { getTests } from "../deps.ts";
import * as utils from "../utils.ts";

const parseInput = (rawInput: string) => {
  const [rawPieces, rawTargets] = rawInput.trim().split("\n\n");

  return {
    pieces: rawPieces.split(", ").sort((a, b) => b.length - a.length),
    targets: rawTargets.split("\n"),
  }
};

const solve = (rawInput: string) => {
  const { targets, pieces } = parseInput(rawInput);

  const countCombinations = utils.memoize((target: string): number => {
    if (target.length == 0) return 1;
  
    let combos = 0;
    for (const piece of pieces) {
      if (target.startsWith(piece)) {
        combos += countCombinations(target.slice(piece.length));
      }
    }
  
    return combos;
  });

  const validTargets = targets.map(countCombinations).filter((x) => x > 0);
  return [validTargets.length, utils.sum(validTargets)];
};

const test = await getTests();
run({
  part1: {
    tests: [
      {
        input: test,
        expected: 6,
      },
    ],
    solution: input => solve(input)[0],
  },
  part2: {
    tests: [
      {
        input: test,
        expected: 16,
      },
    ],
    solution: input => solve(input)[1],
  },
  onlyTests: false,
});