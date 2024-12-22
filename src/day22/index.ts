import run, { getTests } from "../deps.ts";
import * as utils from "../utils.ts";
import RNG from "./rng.ts";

const parseInput = (rawInput: string) => {
  return rawInput.split("\n").map(Number).map(seed => new RNG(seed));
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  for (let i = 0; i < 2000; i++) {
    input.forEach(rng => rng.next());
  }
  
  return utils.sum(input.map(rng => rng.seed));
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const deltas = Array.from({ length: input.length })
    .map(() => [] as number[]);
  
  const seen = new Set<string>();

  const valuesForSequence = new Map<string, number>();
  const consideredMonkeys = new Set<string>();

  for (let i = 0; i < 2000; i++) {
    input.forEach((rng, j) => {
      const oldDigit = rng.seed % 10;
      const newDigit = rng.next() % 10;
      const delta = newDigit - oldDigit;

      deltas[j].push(delta);

      if (i >= 3) {
        const seq = deltas[j].slice(deltas[j].length - 4).join(",");
        seen.add(seq);

        const key = `${seq},${j}`;

        if (!consideredMonkeys.has(key)) {
          valuesForSequence.set(seq, (valuesForSequence.get(seq) ?? 0) + newDigit);
          consideredMonkeys.add(key);
        }
      }
    });
  }

  return utils.max(valuesForSequence.values())
};

const [test1, test2] = await getTests().then(s => s.split("\n\n"));
run({
  part1: {
    tests: [
      {
        input: test1,
        expected: 37327623,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: test2,
        expected: 23,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});