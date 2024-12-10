import run from "../deps.ts";

const parseInput = (rawInput: string) => {
  return rawInput.matchAll(/(mul|do|don't)\((?:(\d{1,3}),(\d{1,3}))?\)/g);
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  let result = 0;
  for (const match of input) {
    result += match[2] ? parseInt(match[2]) * parseInt(match[3]) : 0;
  }
  
  return result;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  let result = 0;
  let enabled = true;
  for (const match of input) {
    switch (match[1]) {
      case "mul": {
        if (!enabled) break;
        result += match[2] ? parseInt(match[2]) * parseInt(match[3]) : 0;
        break;
      }
      case "do": {
        enabled = true;
        break;
      }
      case "don't": {
        enabled = false;
        break;
      }
    }
  }
  
  return result; 
};

run({
  part1: {
    tests: [
      {
        input: "xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))",
        expected: 161,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: "xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))",
        expected: 48,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});