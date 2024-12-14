import run, { getTests } from "../deps.ts";
import * as utils from "../utils.ts";
import { Game } from "./game.ts";

const parseInput = (rawInput: string) => {
  return rawInput.trim().split("\n").map((line) => {
    const regex = /p=(\d+),(\d+) v=(-?\d+),(-?\d+)/;
    const [, px, py, vx, vy] = line.match(regex)!;
    return {
      position: new utils.Vector(parseInt(px), parseInt(py)),
      velocity: new utils.Vector(parseInt(vx), parseInt(vy)),
    };
  });
};

const part1 = (rawInput: string, isTest: boolean) => {
  const input = parseInput(rawInput);
  const [width, height] = isTest ? [11, 7] : [101, 103];

  const game = new Game(input, width, height);

  // game.print(false);

  for (let i = 0; i < 100; i++) {
    game.tick();
  }
  
  return game.part1();
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const [width, height] = [101, 103];

  const game = new Game(input, width, height);
  
  return game.part2();
};

const tests = await getTests();
run({
  part1: {
    tests: [
      {
        input: tests,
        expected: 12,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
    ],
    solution: part2,
  },
  onlyTests: false,
});