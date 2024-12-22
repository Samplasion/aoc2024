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

  // We consider a sequence of four [-9...9] values to be a 
  // 4-digit base-19 number offset by 9 [0...I].
  // We can then use the sequence's number value to speed up
  // the process.
  //
  // This has brought the runtime down from 10s to ~720ms on my machine.
  const sequenceCeiling = 19 ** 4;
  
  const valuesForSequence = new Map<number, number>();
  input.forEach((rng) => {
    let sequence = 0;
    const bought = new Set<number>();

    for (let i = 0; i < 2000; i++) {
      const oldDigit = rng.seed % 10;
      const newDigit = rng.next() % 10;
      const delta = newDigit - oldDigit;

      sequence = (sequence * 19 + delta + 9) % sequenceCeiling;

      if (i >= 3) {
        if (bought.has(sequence)) {
          continue;
        }

        bought.add(sequence);
        valuesForSequence.set(sequence, (valuesForSequence.get(sequence) ?? 0) + newDigit);
      }
    }
  });

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