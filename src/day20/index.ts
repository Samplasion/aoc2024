import run, { getTests } from "../deps.ts";
import Grid from "../grid.ts";
import * as utils from "../utils.ts";

const parseInput = (rawInput: string) => {
  return Grid.fromString(rawInput);
};

const part1 = (rawInput: string, isTest: boolean) => {
  const input = parseInput(rawInput);
  const threshold = isTest ? 1 : 100;

  const path = input.getShortestPath(
    input.find("S")!,
    input.find("E")!,
    (value) => value !== "#",
  )!;

  let count = 0;

  for (const pos of path.path) {
    for (const direction of utils.Vector.DIRECTIONS) {
      const start = pos.add(direction);
      const end = pos.add(direction).add(direction);

      if (input.isOutOfBounds(start.x, start.y) || input.isOutOfBounds(end.x, end.y)) {
        continue;
      }

      // If we're not looking at a wall, skip
      if (input.get(start) !== "#") {
        continue;
      }

      // If this cheat would result in us being inside a wall, skip
      if (input.get(end) === "#") {
        continue;
      }

      const saving = path.distances[end.x][end.y] - path.distances[pos.x][pos.y] - 2;

      if (saving >= threshold) {
        count++;
      }
    }
  }

  return count;
};

const part2 = (rawInput: string, isTest: boolean) => {
  const input = parseInput(rawInput);
  const threshold = isTest ? 50 : 100;

  const path = input.getShortestPath(
    input.find("S")!,
    input.find("E")!,
    (value) => value !== "#",
  )!;

  const cheats = (i: number) => {
    let count = 0;
    for (let j = 0; j < i; j++) {
      const dist = path.path[i].manhattanDistance(path.path[j]);
      const saving = path.distances[path.path[i].x][path.path[i].y] - path.distances[path.path[j].x][path.path[j].y] - dist;

      if (dist <= 20 && saving >= threshold) {
        count++;
      }
    }
    return count;
  };

  let count = 0;

  const range = new utils.Range(0, path.path.length);
  for (const i of range) count += cheats(i);

  return count;
};

const test = await getTests();
run({
  part1: {
    tests: [
      {
        input: test,
        expected: 44,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: test,
        expected: 285,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});