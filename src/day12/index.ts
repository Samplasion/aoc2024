import run from "../deps.ts";
import Grid from "../grid.ts";
import * as utils from "../utils.ts";

const parseInput = (rawInput: string) => {
  return Grid.fromString(rawInput);
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const letters = new Set(input.toArray().flat());

  let price = 0;

  let i = 0;
  for (const letter of letters) {
    i++;
    for (const region of utils.regionsIter(input, {
      matcher: (v) => v.value === letter,
    })) {
      price += utils.perimeter(region).length * region.length;
    }
  }
  
  return price;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const letters = new Set(input.toArray().flat());

  let price = 0;

  let i = 0;
  for (const letter of letters) {
    i++;
    for (const region of utils.regionsIter(input, {
      matcher: (v) => v.value === letter,
    })) {
      price += utils.sides(region) * region.length;
    }
  }
  
  return price;
};

run({
  part1: {
    tests: [
      {
        input: `
AAAA
BBCD
BBCC
EEEC`.trim(),
        expected: 140,
      },
      {
        input: `
OOOOO
OXOXO
OOOOO
OXOXO
OOOOO`.trim(),
        expected: 772,
      },
      {
        input: `
RRRRIICCFF
RRRRIICCCF
VVRRRCCFFF
VVRCCCJFFF
VVVVCJJCFE
VVIVCCJJEE
VVIIICJJEE
MIIIIIJJEE
MIIISIJEEE
MMMISSJEEE`.trim(),
        expected: 1930,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
AAAA
BBCD
BBCC
EEEC`.trim(),
        expected: 80,
      },
      {
        input: `
OOOOO
OXOXO
OOOOO
OXOXO
OOOOO`.trim(),
        expected: 436,
      },
      {
        input: `
EEEEE
EXXXX
EEEEE
EXXXX
EEEEE`.trim(),
        expected: 236,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});