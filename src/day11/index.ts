import run from "../deps.ts";
import Stones from "./stones.ts";

const parseInput = (rawInput: string) => {
  return new Stones(rawInput.split(" ").map((x) => parseInt(x)));
};

const simulate = (iterations: number) => (rawInput: string) => {
  const input = parseInput(rawInput);

  for (let i = 0; i < iterations; i++) {
    input.blink();
  }
  
  return input.getSize();
};

run({
  part1: {
    tests: [
      {
        input: "125 17",
        expected: 55312,
      },
    ],
    solution: simulate(25),
  },
  part2: {
    tests: [],
    solution: simulate(75),
  },
  onlyTests: false,
});