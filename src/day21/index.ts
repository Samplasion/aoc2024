import run, { getTests } from "../deps.ts";
import Grid from "../grid.ts";
import * as utils from "../utils.ts";

const parseInput = (rawInput: string) => {
  return rawInput.trim().split("\n");
};

const keypad = Grid.fromString(`
789
456
123
.0A`.trim());
const directionalPad = Grid.fromString(`.^A
<v>`);

const pathToMove = (path: utils.Vector[]): string => {
  let s = "";

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];

    if (p1.x < p2.x) s += ">";
    if (p1.x > p2.x) s += "<";
    if (p1.y < p2.y) s += "v";
    if (p1.y > p2.y) s += "^";
  }

  s += "A";

  return s;
}

const makeMemo = (firstRobot: number) => {
  const inner = utils.memoize2((code: string, robot: number) => {
    const pad = robot === firstRobot ? keypad : directionalPad;
    let current = 'A';
    let length = 0;
    for (let i = 0; i < code.length; i++) {
      const moves = pad.getAllPaths(pad.find(current)!, pad.find(code[i])!, v => v != ".")!
        .map((path) => pathToMove(path))
        .sort((a, b) => a.length - b.length);
      if (robot === 0) {
        length += moves[0].length;
      } else {
        // If the robot is not the last, we need to check all possible paths
        // because the shortest path for this robot might not be the shortest path overall
        length += Math.min(...moves.map(move => inner(move, robot - 1)));
      }
      current = code[i];
    }
    return length;
  });
  return inner;
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const lengths = makeMemo(2);

  return utils.sum(input.map(code => {
    const numbers = parseInt(code.replaceAll(/[^0-9]/g, "").replace(/^0+/, ""), 10);
    return numbers * lengths(code, 2);
  }));
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const lengths = makeMemo(25);

  return utils.sum(input.map(code => {
    const numbers = parseInt(code.replaceAll(/[^0-9]/g, "").replace(/^0+/, ""), 10);
    return numbers * lengths(code, 25);
  }));
};

const test = await getTests();
run({
  part1: {
    tests: [
      {
        input: test,
        expected: 126384,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [],
    solution: part2,
  },
  onlyTests: false,
});