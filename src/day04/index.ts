import run from "../deps.ts";
import Grid, { Position } from "../grid.ts";
import * as utils from "../utils.ts";

const parseInput = (rawInput: string) => {
  return Grid.fromString(rawInput.trim());
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const xs = input.allPositionsWhere((value) => value === "X");
  const directions = [
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ];
  
  return utils.sum(xs.flatMap((pos) => directions.map((direction) => {
    return +_part1Helper(input, pos.x, pos.y, direction);
  })));
};

function _part1Helper(grid: Grid<string>, x: number, y: number, direction: { x: number, y: number }) {
  const positions: Position[] = [
    { x, y },
    { x: x + direction.x, y: y + direction.y },
    { x: x + 2 * direction.x, y: y + 2 * direction.y },
    { x: x + 3 * direction.x, y: y + 3 * direction.y },
  ].filter((pos) => {
    return pos.x >= 0 && pos.x < grid.width && pos.y >= 0 && pos.y < grid.height;
  });

  return positions.map((pos) => grid.get(pos.x, pos.y)).join("") === "XMAS";
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const xs = input.allPositionsWhere((value) => value === "A");
  
  return utils.sum(xs.map((pos) => {
    if (pos.x < 1 || pos.x >= input.width - 1 || pos.y < 1 || pos.y >= input.height - 1) {
      return 0;
    }

    // Check primary diagonal
    const primary = [
      { x: pos.x - 1, y: pos.y - 1 },
      { x: pos.x, y: pos.y },
      { x: pos.x + 1, y: pos.y + 1 },
    ].map((pos) => input.get(pos.x, pos.y)).join("");
    const primaryValid = primary === "MAS" || primary === "SAM";

    // Check secondary diagonal
    const secondary = [
      { x: pos.x + 1, y: pos.y - 1 },
      { x: pos.x, y: pos.y },
      { x: pos.x - 1, y: pos.y + 1 },
    ].map((pos) => input.get(pos.x, pos.y)).join("");
    const secondaryValid = secondary === "MAS" || secondary === "SAM";

    return +(primaryValid && secondaryValid);
  }));
};

run({
  part1: {
    tests: [
      {
        input: `
MMMSXXMASM
MSAMXMSMSA
AMXSXMAAMM
MSAMASMSMX
XMASAMXAMM
XXAMMXXAMA
SMSMSASXSS
SAXAMASAAA
MAMMMXMMMM
MXMXAXMASX`.trim(),
        expected: 18,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
MMMSXXMASM
MSAMXMSMSA
AMXSXMAAMM
MSAMASMSMX
XMASAMXAMM
XXAMMXXAMA
SMSMSASXSS
SAXAMASAAA
MAMMMXMMMM
MXMXAXMASX`.trim(),
        expected: 9,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});