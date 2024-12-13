import run from "../deps.ts";
import * as utils from "../utils.ts";

interface ClawMachine {
  A: utils.Vector,
  B: utils.Vector,
  prize: utils.Vector,
}

const parseInput = (rawInput: string, offset = 0): ClawMachine[] => {
  return rawInput.split("\n\n").map((rawClaw) => {
    const match = rawClaw.match(/Button A: X\+(\d+), Y\+(\d+)\nButton B: X\+(\d+), Y\+(\d+)\nPrize: X=(\d+), Y=(\d+)\n?/);

    const [Ax, Ay, Bx, By, Px, Py] = match!.slice(1).map(Number);

    return {
      A: new utils.Vector(Ax, Ay),
      B: new utils.Vector(Bx, By),
      prize: new utils.Vector(Px + offset, Py + offset),
    }
  })
};

const solve = (claws: ClawMachine[]) => {
  return utils.sum(claws.map(({ A, B, prize }) => {
    const delta = A.x * B.y - A.y * B.x;
    const fx = new utils.Fraction((B.y * prize.x - B.x * prize.y), delta);
    const fy = new utils.Fraction((A.x * prize.y - A.y * prize.x), delta);

    if (!fx.isInteger() || !fy.isInteger()) {
      return 0;
    }

    const x = fx.toNumber();
    const y = fy.toNumber();

    return x * 3 + y;
  }))
};

const part1 = (rawInput: string) => solve(parseInput(rawInput));
const part2 = (rawInput: string) => solve(parseInput(rawInput, 1e13));

run({
  part1: {
    tests: [
      {
        input: `
Button A: X+94, Y+34
Button B: X+22, Y+67
Prize: X=8400, Y=5400

Button A: X+26, Y+66
Button B: X+67, Y+21
Prize: X=12748, Y=12176

Button A: X+17, Y+86
Button B: X+84, Y+37
Prize: X=7870, Y=6450

Button A: X+69, Y+23
Button B: X+27, Y+71
Prize: X=18641, Y=10279`.trim(),
        expected: 480,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
Button A: X+94, Y+34
Button B: X+22, Y+67
Prize: X=8400, Y=5400

Button A: X+26, Y+66
Button B: X+67, Y+21
Prize: X=12748, Y=12176

Button A: X+17, Y+86
Button B: X+84, Y+37
Prize: X=7870, Y=6450

Button A: X+69, Y+23
Button B: X+27, Y+71
Prize: X=18641, Y=10279`.trim(),
        expected: 875318608908,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});