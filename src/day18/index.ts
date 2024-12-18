import run, { getTests } from "../deps.ts";
import Grid from "../grid.ts";
import * as utils from "../utils.ts";

const parseInput = (rawInput: string) => {
  return rawInput.trim().split("\n").map((line) => {
    const [x, y] = line.split(",").map(Number);
    return new utils.Vector(x, y);
  });
};

const part1 = (rawInput: string, isTest: boolean) => {
  const input = parseInput(rawInput);
  const size = isTest ? 7 : 71;
  const ticks = isTest ? 12 : 1024;

  const grid = new Grid(size, size, ".");

  for (let i = 0; i < Math.min(input.length, ticks); i++) {
    grid.set(input[i].x, input[i].y, "#");
  }

  return dijkstra(grid,
    new utils.Vector(0, 0),
    new utils.Vector(size - 1, size - 1),
  )?.distance;
};

function dijkstra<T>(
  grid: Grid<T>,
  start: utils.Vector,
  end: utils.Vector,
): { distance: number; path: utils.Vector[] } | null {
  const rows = grid.height;
  const cols = grid.width;
  const directions = utils.Vector.DIRECTIONS;

  const distance: number[][] = Array.from(
    { length: rows },
    () => Array(cols).fill(Infinity),
  );
  const previous: (utils.Vector | null)[][] = Array.from(
    { length: rows },
    () => Array(cols).fill(null),
  );
  const visited: boolean[][] = Array.from(
    { length: rows },
    () => Array(cols).fill(false),
  );

  const queue: { point: utils.Vector; dist: number }[] = [];
  distance[start.x][start.y] = 0;
  queue.push({ point: start, dist: 0 });

  while (queue.length > 0) {
    queue.sort((a, b) => a.dist - b.dist);
    const { point } = queue.shift()!;
    const { x, y } = point;

    if (visited[x][y]) continue;
    visited[x][y] = true;

    // We found the end; reconstruct the path
    if (x === end.x && y === end.y) {
      const path: utils.Vector[] = [];
      let current: utils.Vector | null = end;

      while (current) {
        path.push(current);
        current = previous[current.x][current.y];
      }

      return { distance: distance[end.x][end.y], path: path.reverse() };
    }

    for (const dir of directions) {
      const newX = x + dir.x;
      const newY = y + dir.y;

      if (!grid.isOutOfBounds(newX, newY) && !visited[newX][newY]) {
        let adjacentWeight = 0;

        const previousP = new utils.Vector(x, y);
        const current = new utils.Vector(newX, newY);

        if (grid.get(newX, newY) === "#") {
          adjacentWeight = Infinity;
        } else {
          adjacentWeight = 1;
        }

        const newDist = distance[x][y] + adjacentWeight;

        if (newDist < distance[newX][newY]) {
          distance[newX][newY] = newDist;
          previous[newX][newY] = previousP;
          queue.push({ point: current, dist: newDist });
        }
      }
    }
  }

  return null;
}

const part2 = (rawInput: string, isTest: boolean) => {
  const input = parseInput(rawInput);
  const size = isTest ? 7 : 71;
  const ticks = isTest ? 12 : 1024;

  const grid = new Grid(size, size, ".");

  for (let i = 0; i < Math.min(input.length, ticks); i++) {
    grid.set(input[i].x, input[i].y, "#");
  }

  const calcPath = (grid: Grid<string>) => {
    return new Set(dijkstra(grid,
      new utils.Vector(0, 0),
      new utils.Vector(size - 1, size - 1)
    )?.path.map((p) => `${p.x},${p.y}`));
  };

  const remaining = input.slice(ticks);
  let path = calcPath(grid);
  for (let i = 0; i < remaining.length; i++) {
    grid.set(remaining[i].x, remaining[i].y, "#");

    if (path.has(`${remaining[i].x},${remaining[i].y}`)) {
      path = calcPath(grid);
      if (path.size == 0) {
        return `${remaining[i].x},${remaining[i].y}`;
      }
    }
  }
};

const test = await getTests();
run({
  part1: {
    tests: [
      {
        input: test,
        expected: 22,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: test,
        expected: "6,1",
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});