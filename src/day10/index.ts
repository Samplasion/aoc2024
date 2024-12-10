import run from "../deps.ts";
import Grid from "../grid.ts";
import * as utils from "../utils.ts";

const parseInput = (rawInput: string) => {
  return Grid.fromString(rawInput, (char) => +char);
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const trailheads = input.allPositionsWhere((x) => x == 0);
  
  return utils.sum(trailheads.map((pos) => _trailheadScore(input, pos.x, pos.y)));
};

function _trailheadScore(grid: Grid<number>, x: number, y: number) {
  return _trailheadScoreRecursive(grid, x, y, new Set()).size;
}

function _trailheadScoreRecursive(grid: Grid<number>, x: number, y: number, ends: Set<string> = new Set()) {
  if (grid.get(x, y) == 9) return new Set([...ends, `${x},${y}`]);

  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  for (const direction of directions) {
    const newX = x + direction.x;
    const newY = y + direction.y;
    if (newX < 0 || newX >= grid.width || newY < 0 || newY >= grid.height) {
      continue;
    }

    if (grid.get(newX, newY) == grid.get(x, y) + 1) {
      ends = new Set([...ends, ..._trailheadScoreRecursive(grid, newX, newY, ends)]);
    }
  }

  return ends;
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const trailheads = input.allPositionsWhere((x) => x == 0);
  
  return utils.sum(trailheads.map((pos) => _trailheadRating(input, pos.x, pos.y)));
};

function _trailheadRating(grid: Grid<number>, x: number, y: number) {
  return _trailheadRatingRecursive(grid, x, y, 1);
}

function _trailheadRatingRecursive(grid: Grid<number>, x: number, y: number, length: number) {
  if (grid.get(x, y) == 9) return 1;

  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  let accessiblePaths = 0;

  for (const direction of directions) {
    const newX = x + direction.x;
    const newY = y + direction.y;
    if (newX < 0 || newX >= grid.width || newY < 0 || newY >= grid.height) {
      continue;
    }

    // console.log(" - Checking", [newX, newY], `base: ${grid.get(x, y)}, target: ${grid.get(x, y) + 1},`, grid.get(newX, newY), "==", grid.get(x, y) + 1, grid.get(newX, newY) == grid.get(x, y) + 1);

    if (grid.get(newX, newY) == grid.get(x, y) + 1) {
      accessiblePaths += _trailheadRatingRecursive(grid, newX, newY, length + 1);
    }
  }

  return accessiblePaths;
}

run({
  part1: {
    tests: [
      {
        input: `
89010123
78121874
87430965
96549874
45678903
32019012
01329801
10456732`.trim(),
        expected: 36,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
89010123
78121874
87430965
96549874
45678903
32019012
01329801
10456732`.trim(),
        expected: 81,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});