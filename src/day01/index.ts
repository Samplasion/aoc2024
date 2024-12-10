import run from "../deps.ts";
import * as utils from "../utils.ts";

const parseInput = (rawInput: string) => {
  return utils.transpose(rawInput.trim().split("\n").map((line) => line.trim().split(/\s+/).map(Number)));
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput).map(row => row.sort((a, b) => a - b));

  return utils.sum(input[0].map((_, i) => Math.abs(input[0][i] - input[1][i])));
};

const part2 = (rawInput: string) => {
  const [first, second] = parseInput(rawInput);
  const occurrences = utils.occurrences(second);
  
  return utils.sum(first.map(v => v * (occurrences.get(v) ?? 0)));
};

run({
  part1: {
    tests: [
      {
        input: `
3   4
4   3
2   5
1   3
3   9
3   3`.trim(),
        expected: 11,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
3   4
4   3
2   5
1   3
3   9
3   3`.trim(),
        expected: 31,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});