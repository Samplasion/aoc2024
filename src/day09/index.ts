import run, { getTests } from "../deps.ts";
import * as utils from "../utils.ts";

const parseInput = (rawInput: string) => {
  return rawInput.trim().split("").map(c => parseInt(c));
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const drive: Array<number | null> = [];

  for (let pos = 0; pos < input.length; pos++) {
    const n = input[pos];
    for (let i = 0; i < n; i++) {
      if (pos % 2 === 0) {
        drive.push(pos / 2);
      } else {
        drive.push(null);
      }
    }
  }

  const nullIndices = drive.map((v, i) => v === null ? i : null).filter(v => v !== null);

  const usedSpace = utils.lastIndexWhere(drive, v => v !== null);
  while (nullIndices.length > 0) {
    const nullIndex = nullIndices.shift()!;
    utils.swap(drive, utils.lastIndexWhere(drive, v => v !== null, usedSpace), nullIndex);
  }
  
  return utils.sum(drive.filter(v => v !== null).map((v, i) => i * v));
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const drive: Array<{value: number | null, size: number}> = [];

  for (let pos = 0; pos < input.length; pos++) {
    const n = input[pos];
    drive.push({ value: pos % 2 === 0 ? pos / 2 : null, size: n });
  }

  // let nullIndices = drive.map((v, i) => v.value === null ? i : null).filter(v => v !== null);
  
  for (let i = drive.length - 1; i >= 0; i--) {
    if (drive[i].value === null) {
      continue;
    }

    const leftmostFreeSpaceBeforeFile = drive.slice(0, i).findIndex(v => v.value === null && v.size >= drive[i].size);
    if (leftmostFreeSpaceBeforeFile === -1) {
      continue;
    }

    const file = drive[i];
    const freeSpace = drive[leftmostFreeSpaceBeforeFile];

    if (file.size < freeSpace.size) {
      drive.splice(i, 1, { value: null, size: file.size });
      drive.splice(leftmostFreeSpaceBeforeFile, 1, file, { value: null, size: freeSpace.size - file.size });
    } else {
      utils.swap(drive, leftmostFreeSpaceBeforeFile, i);
    }
  }

  const expandedDrive = drive.flatMap(v => Array.from({ length: v.size }, () => v.value));
  
  return utils.sum(expandedDrive.map((v, i) => v !== null ? i * v : 0));
};

run({
  part1: {
    tests: [
      {
        input: "2333133121414131402",
        expected: 1928,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: "2333133121414131402",
        expected: 2858,
      },
      {
        input: await getTests(),
        expected: 5799706413896802,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});