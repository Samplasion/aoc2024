import run from "../deps.ts";
import * as utils from "../utils.ts";

const parseInput = (rawInput: string) => {
  const lines = rawInput.trim().split("\n");
  const result: { [target: number]: number[] } = {};

  for (const line of lines) {
    const [target, rule] = line.split(": ");
    result[Number(target)] = rule.split(" ").map(Number);
  }

  return result;
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  let sum = 0;

  for (const [target, rule] of Object.entries(input)) {
    for (const operators of utils.combinationsOf(["+", "*"], rule.length - 1)) {
      if (+target == _evaluateRule([...rule], operators, +target)) {
        sum += +target;
        break;
      }
    }
  }
  
  return sum;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  let sum = 0;

  for (const [target, rule] of Object.entries(input)) {
    for (const operators of utils.combinationsOf(["+", "*", "||"], rule.length - 1)) {
      const computed = _evaluateRule([...rule], operators, +target);
      if (computed < 0) break;
      if (+target == computed) {
        sum += +target;
        break;
      }
    }
  }
  
  return sum;
};

function _evaluateRule(rule: number[], operators: string[], target: number) {
  let result = rule.shift()!;

  while (rule.length > 0) {
    if (result > target) {
      // Short-circuit
      return -1;
    }

    const operator = operators.shift();
    if (operator == "+") {
      result += rule.shift()!;
    } else if (operator == "*") {
      result *= rule.shift()!;
    } else if (operator == "||") {
      let operand = rule.shift()!;
      let digits = ~~Math.log10(operand) + 1;
      result = result * Math.pow(10, digits) + operand;
    } else if (operator == undefined) {
      throw new Error("Not enough operators");
    }
  }

  return result;
}

run({
  part1: {
    tests: [
      {
        input: `
190: 10 19
3267: 81 40 27
83: 17 5
156: 15 6
7290: 6 8 6 15
161011: 16 10 13
192: 17 8 14
21037: 9 7 18 13
292: 11 6 16 20`.trim(),
        expected: 3749,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
190: 10 19
3267: 81 40 27
83: 17 5
156: 15 6
7290: 6 8 6 15
161011: 16 10 13
192: 17 8 14
21037: 9 7 18 13
292: 11 6 16 20`.trim(),
        expected: 11387,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});