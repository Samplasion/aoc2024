import run from "../deps.ts";
import * as utils from "../utils.ts";
import CPU from "./cpu.ts";

const parseInput = (rawInput: string) => {
  const [_, a, b, c, bc] = rawInput.match(/Register A: (\d+)\nRegister B: (\d+)\nRegister C: (\d+)\n\nProgram: (.+)/)!;

  return {
    a: +a,
    b: +b,
    c: +c,
    program: bc.split(",").map((v) => +v),
  }
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const cpu = new CPU();
  cpu.reset(input.a, input.b, input.c);

  return cpu.run(input.program).join(",");
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  function checkDigit(a: bigint, digit: number): bigint[] | null {
    if (digit >= input.program.length) {
      return [a >> 3n];
    }

    const cpu = new CPU();
    cpu.reset(Number(a), input.b, input.c);
    const out = cpu.run(input.program).reverse();

    if (out[digit] == input.program.toReversed()[digit]) {
      return new utils.Range(0, 8).map(i => {
        return checkDigit(a << 3n | BigInt(i), digit + 1);
      }).filter(a => a != null).flat();
    }

    return null;
  }

  const possible = new Set<number>();
  for (let i = 0; i <= 7; i++) {
    checkDigit(BigInt(i), 0)?.forEach(a => possible.add(Number(a)));
  }
  const possibleArr = [...possible];
  possibleArr.sort((a, b) => a - b);
  return possibleArr[0];
};

run({
  part1: {
    tests: [
      {
        input: `Register A: 729
Register B: 0
Register C: 0

Program: 0,1,5,4,3,0`,
        expected: "4,6,3,5,6,3,5,2,1,0",
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `Register A: 2024
Register B: 0
Register C: 0

Program: 0,3,5,4,3,0`,
        expected: 117440,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});