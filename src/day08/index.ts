import run from "../deps.ts";
import * as utils from "../utils.ts";

const parseInput = (rawInput: string) => {
  return rawInput.trim().split("\n").map((line) => line.split(""));
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const antennas: { [k: string]: [number, number][] } = {};
  const antinodes = new Set<string>();
  const width = input[0].length;
  const height = input.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < input[y].length; x++) {
      if (input[y][x] != ".") {
        antennas[input[y][x]] ??= [];
        antennas[input[y][x]].push([x, y]);
      }
    }
  }

  console.log(antennas);

  for (const antenna of Object.keys(antennas)) {
    const locations = antennas[antenna];
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      for (let j = 0; j < locations.length; j++) {
        const other = locations[j];

        if (i == j) {
          continue;
        }

        const dx = other[0] - location[0];
        const dy = other[1] - location[1];

        const skip = [other[0] + dx, other[1] + dy];

        if (
          skip[0] >= 0 && skip[0] < width && skip[1] >= 0 &&
          skip[1] < height
          // && !antennas[antenna].some((loc) => loc[0] == skip[0] && loc[1] == skip[1])
        ) {
          antinodes.add(`${skip[0]},${skip[1]}`);
        }
      }
    }
  }

  const locations = [...antinodes]
    .map((antinode) => antinode.split(",") as [string, string, string])
    .map(([x, y, c]) => [Number(x), Number(y), c] as [number, number, string]);
  const grid = utils.create2DArray(width, height, ".");
  for (const antenna of Object.keys(antennas)) {
    for (const location of antennas[antenna]) {
      if (grid[location[1]][location[0]] != ".") {
        // Yellow - Antenna over antinode
        grid[location[1]][location[0]] = `\x1b[0;33m${antenna}\x1b[0m`;
      } else {
        // Purple - Antenna over empty space
        grid[location[1]][location[0]] = `\x1b[0;35m${antenna}\x1b[0m`;
      }
    }
  }
  for (const location of locations) {
    if (grid[location[1]][location[0]] != ".") {
      // Red - Antinode over antenna or other antinode
      grid[location[1]][location[0]] =
        `\x1b[0;31m${/* location[2] */ "#"}\x1b[0m`;
    } else {
      // Cyan - Antinode over empty space
      grid[location[1]][location[0]] =
        `\x1b[0;36m${/* location[2] */ "#"}\x1b[0m`;
    }
  }
  for (let y = 0; y < grid.length; y++) {
    console.log(grid[y].join(""));
  }

  return antinodes.size;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const antennas: { [k: string]: [number, number][] } = {};
  const antinodes = new Set<string>();
  const width = input[0].length;
  const height = input.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < input[y].length; x++) {
      if (input[y][x] != ".") {
        antennas[input[y][x]] ??= [];
        antennas[input[y][x]].push([x, y]);
      }
    }
  }

  console.log(antennas);

  for (const antenna of Object.keys(antennas)) {
    const locations = antennas[antenna];
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      for (let j = 0; j < locations.length; j++) {
        const other = locations[j];

        if (i == j) {
          antinodes.add(`${location[0]},${location[1]}`);
          continue;
        }

        const dx = other[0] - location[0];
        const dy = other[1] - location[1];

        const skip = [other[0], other[1]];

        while (true) {
          skip[0] += dx;
          skip[1] += dy;

          if (
            skip[0] < 0 || skip[0] >= width || skip[1] < 0 ||
            skip[1] >= height
          ) {
            break;
          }

          antinodes.add(`${skip[0]},${skip[1]}`);
        }
      }
    }
  }

  const locations = [...antinodes]
    .map((antinode) => antinode.split(",") as [string, string, string])
    .map(([x, y, c]) => [Number(x), Number(y), c] as [number, number, string]);
  const grid = utils.create2DArray(width, height, ".");
  for (const antenna of Object.keys(antennas)) {
    for (const location of antennas[antenna]) {
      if (grid[location[1]][location[0]] != ".") {
        // Yellow - Antenna over antinode
        grid[location[1]][location[0]] = `\x1b[0;33m${antenna}\x1b[0m`;
      } else {
        // Purple - Antenna over empty space
        grid[location[1]][location[0]] = `\x1b[0;35m${antenna}\x1b[0m`;
      }
    }
  }
  for (const location of locations) {
    if (grid[location[1]][location[0]] != ".") {
      // Red - Antinode over antenna or other antinode
      grid[location[1]][location[0]] =
        `\x1b[0;31m${/* location[2] */ "#"}\x1b[0m`;
    } else {
      // Cyan - Antinode over empty space
      grid[location[1]][location[0]] =
        `\x1b[0;36m${/* location[2] */ "#"}\x1b[0m`;
    }
  }
  for (let y = 0; y < grid.length; y++) {
    console.log(grid[y].join(""));
  }

  return antinodes.size;
};

// function printAntinodeGrid(
//   locations: [number, number][],
//   width: number,
//   height: number,
// ) {
//   const grid = utils.create2DArray(width, height, ".");
//   for (const location of locations) {
//     grid[location[1]][location[0]] = "#";
//   }

//   for (let y = 0; y < grid.length; y++) {
//     console.log(grid[y].join(""));
//   }
// }

run({
  part1: {
    tests: [
      {
        input: `
............
........0...
.....0......
.......0....
....0.......
......A.....
............
............
........A...
.........A..
............
............`.trim(),
        expected: 14,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
............
........0...
.....0......
.......0....
....0.......
......A.....
............
............
........A...
.........A..
............
............`.trim(),
        expected: 34,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});
