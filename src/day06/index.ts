import run from "../deps.ts";
import * as utils from "../utils.ts";
import { GameGrid } from "./game.ts";

const parseInput = (rawInput: string) => {
  return rawInput.split("\n").map((line) => line.trim().split(""));
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const game = new GameGrid(input);

  for (const _ of game);

  return game.getVisitedCount();
};

const part2 = (rawInput: string) => {
  const input = new GameGrid(parseInput(rawInput));
  
  return utils.sum(input.map((_, x, y) => {
    const wouldLoop = input.withNewObstacle(x, y).wouldLoop();
    return +wouldLoop;
  }));
};

run({
  part1: {
    tests: [
      {
        input: `
....#.....
.........#
..........
..#.......
.......#..
..........
.#..^.....
........#.
#.........
......#...`.trim(),
        expected: 41,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
....#.....
.........#
..........
..#.......
.......#..
..........
.#..^.....
........#.
#.........
......#...`.trim(),
        expected: 6,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});