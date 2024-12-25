import run from "../deps.ts";
import Grid from "../grid.ts";
import * as utils from "../utils.ts";

const parseInput = (rawInput: string) => {
  return Grid.fromString(rawInput);
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const startPosition = input.findIndex((v) => v === "S")!;
  const endPosition = input.findIndex((v) => v === "E")!;

  const { distance: score } = dijkstra<string>(
    input,
    startPosition,
    endPosition,
  )!;

  return score;
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

        const beforePrevious = previous[x]?.[y] == null
          ? new utils.Vector(start.x - 1, start.y)
          : previous[x]?.[y];
        const previousP = new utils.Vector(x, y);
        const current = new utils.Vector(newX, newY);

        if (grid.get(newX, newY) === "#") {
          adjacentWeight = Infinity;
        } else if (
          current.subtract(previousP).direction ===
            previousP.subtract(beforePrevious).direction
        ) {
          adjacentWeight = 1;
        } else {
          adjacentWeight = 1001;
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

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const startPosition = input.findIndex((v) => v === "S")!;
  const endPosition = input.findIndex((v) => v === "E")!;

  const seen = [endPosition.toString()];
  let best = 1e9;
  const dist = new Map<string, number>([[endPosition.toString(), 0]]);
  const dkey = (pos: utils.Vector, dir: utils.Vector) => `${pos.toString()}|${dir.toString()}`;
  // const q: Array<> = [[0, startPosition, new utils.Vector(1, 0), []]];
  const q: utils.PriorityQueue<[score: number, pos: utils.Vector, dir: utils.Vector, path: Set<string>]> = new utils.PriorityQueue(
    ([a], [b]) => a - b,
  );
  q.push([0, startPosition, new utils.Vector(1, 0), new Set()]);

  while (q.length > 0) {
    const [score, pos, dir, path] = q.pop()!;

    if (score > dist.get(dkey(pos, dir))!) continue;
    else dist.set(dkey(pos, dir), score);

    if (pos.toString() === endPosition.toString() && score <= best) {
      best = score;
      seen.push(...path);
    }

    for (const [rot, points] of [[0, 1], [-1, 1001], [1, 1001]]) {
      const nextDir = dir.rotateSquare(rot);
      const newPos = pos.add(nextDir);
      if (input.isOutOfBounds(newPos.x, newPos.y)) continue;
      if (input.get(newPos.x, newPos.y) === "#") continue;
      if (path.has(newPos.toString())) continue;
      const newScore = score + points;
      dist.set(newPos.toString(), newScore);
      q.push([newScore, newPos, nextDir, new Set([...path, pos.toString()])]);
    }
  }

  return new Set(seen).size;
};

run({
  part1: {
    tests: [
//       {
//         input: `
// ###############
// #.......#....E#
// #.#.###.#.###.#
// #.....#.#...#.#
// #.###.#####.#.#
// #.#.#.......#.#
// #.#.#####.###.#
// #...........#.#
// ###.#.#####.#.#
// #...#.....#.#.#
// #.#.#.###.#.#.#
// #.....#...#.#.#
// #.###.#.#.#.#.#
// #S..#.....#...#
// ###############`.trim(),
//         expected: 7036,
//       },
//       {
//         input: `
// #################
// #...#...#...#..E#
// #.#.#.#.#.#.#.#.#
// #.#.#.#...#...#.#
// #.#.#.#.###.#.#.#
// #...#.#.#.....#.#
// #.#.#.#.#.#####.#
// #.#...#.#.#.....#
// #.#.#####.#.###.#
// #.#.#.......#...#
// #.#.###.#####.###
// #.#.#...#.....#.#
// #.#.#.#####.###.#
// #.#.#.........#.#
// #.#.#.#########.#
// #S#.............#
// #################`.trim(),
//         expected: 11048,
//       },
    ],
    solution: part1,
  },
  part2: {
    tests: [
//       {
//         input: `
// ###############
// #.......#....E#
// #.#.###.#.###.#
// #.....#.#...#.#
// #.###.#####.#.#
// #.#.#.......#.#
// #.#.#####.###.#
// #...........#.#
// ###.#.#####.#.#
// #...#.....#.#.#
// #.#.#.###.#.#.#
// #.....#...#.#.#
// #.###.#.#.#.#.#
// #S..#.....#...#
// ###############`.trim(),
//         expected: 45,
//       },
//       {
//         input: `
// #################
// #...#...#...#..E#
// #.#.#.#.#.#.#.#.#
// #.#.#.#...#...#.#
// #.#.#.#.###.#.#.#
// #...#.#.#.....#.#
// #.#.#.#.#.#####.#
// #.#...#.#.#.....#
// #.#.#####.#.###.#
// #.#.#.......#...#
// #.#.###.#####.###
// #.#.#...#.....#.#
// #.#.#.#####.###.#
// #.#.#.........#.#
// #.#.#.#########.#
// #S#.............#
// #################`.trim(),
//         expected: 64,
//       },
    ],
    solution: part2,
  },
  onlyTests: false,
});
