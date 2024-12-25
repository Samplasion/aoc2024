import run, { getTests } from "../deps.ts";
import * as utils from "../utils.ts";

const parseSchematic = (schematic: string): [lock: number[], key: number[]] => {
  const schem = utils.transpose(schematic.split("\n").map((row) => row.split("")));
  
  if (schem[0][0] == "#") {
    // lock
    return [schem.map(col => col.filter(el => el == "#").length - 1), []];
  } else {
    // key
    return [[], schem.map(col => col.filter(el => el == "#").length - 1)];
  }
}

const parseInput = (rawInput: string) => {
  const locks: number[][] = [];
  const keys: number[][] = [];

  rawInput.trim().split("\n\n").map(parseSchematic).forEach(([lock, key]) => {
    if (lock.length) locks.push(lock);
    if (key.length) keys.push(key);
  });

  return {
    locks,
    keys,
  };
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const check = (lock: number[], key: number[]) => {
    for (let i = 0; i < lock.length; i++) {
      if (lock[i] + key[i] > 5) {
        return false;
      }
    }
    return true;
  };

  let valid = 0;

  for (let i = 0; i < input.locks.length; i++) {
    for (let j = 0; j < input.keys.length; j++) {
      if (check(input.locks[i], input.keys[j]))
        valid++;
    }
  }
  
  return valid;
};

const part2 = () => {
  console.log("Congrats! You've finished Advent of Code 2024! 🎉");
};

const test = await getTests();
run({
  part1: {
    tests: [
      {
        input: test,
        expected: 3,
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
