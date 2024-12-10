import run from "../deps.ts";

const parseInput = (rawInput: string) => {
  return rawInput.trim().split("\n").map((line) => line.split(" ").map((n) => parseInt(n)));
};

function _levelSafety(level: number[]) {
  const coefficient = level[0] < level[1] ? 1 : -1;
  level = level.map((n) => n * coefficient);
  
  for (let i = 1; i < level.length; i++) {
    if (level[i - 1] >= level[i]) return false;
    if (level[i] - level[i - 1] >= 4) return false;
    if (level[i] - level[i - 1] < 1) return false;
  }

  return true;
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.filter(_levelSafety).length;
};

function* problemDampener(level: number[]) {
  for (let i = 0; i < level.length; i++) {
    yield level.filter((_, j) => j !== i);
  }
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  
  return input.filter((level) => {
    if (_levelSafety(level)) return true;
    for (const dampened of problemDampener(level)) {
      if (_levelSafety(dampened)) return true;
    }
    return false;
  }).length;
};

const test = `
7 6 4 2 1
1 2 7 8 9
9 7 6 2 1
1 3 2 4 5
8 6 4 4 1
1 3 6 7 9`.trim();
run({
  part1: {
    tests: [
      {
        input: test,
        expected: 2,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: test,
        expected: 4,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});