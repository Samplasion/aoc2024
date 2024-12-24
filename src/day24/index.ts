import run, { getTests } from "../deps.ts";
import * as utils from "../utils.ts";

type Operator = "AND" | "OR" | "XOR";

const parseInput = (rawInput: string) => {
  const [initial, connections] = rawInput.trim().split("\n\n");
  return {
    initial: initial.split("\n").map((line) => line.split(": ")).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}) as Record<string, number>,
    connections: connections.split("\n").map((line) => {
      const [operation, output] = line.split(" -> ");
      return [operation.split(" "), output] as [string[], string];
    }).map(([[op1, operator, op2], result]) => ({ op1, operator: operator as Operator, op2, result })),
  };
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const wires = { ...input.initial };
  const queue = input.connections.slice();

  while (queue.length) {
    const connection = queue.shift()!;
    const { op1, operator, op2, result } = connection;

    if (!(op1 in wires) || !(op2 in wires)) {
      queue.push(connection);
      continue;
    }

    const value1 = wires[op1];
    const value2 = wires[op2];
    
    let resultValue;
    switch (operator) {
      case "AND":
        resultValue = value1 & value2;
        break;
      case "OR":
        resultValue = value1 | value2;
        break;
      case "XOR":
        resultValue = value1 ^ value2;
        break;
    }
    wires[result] = resultValue;
  }

  const zKeys = Object.keys(wires).filter((key) => /z\d\d/.test(key)).sort().reverse();

  return zKeys.reduce((acc, key) => {
    // Don't use bitwise operators here: the result is a 46-bit number
    return (acc * 2) + wires[key];
  }, 0);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const reverseConnections = input.connections.reduce((acc, conn) => {
    acc[conn.result] = conn;
    return acc;
  }, {} as Record<string, { op1: string, operator: Operator, op2: string, result: string }>);

  const inspect = (node: string, depth = 3, maxDepth = 3) => {
    if (depth === 0) return;
    if (node in reverseConnections) {
      const { op1, operator, op2, result } = reverseConnections[node];
      const indent = "  ".repeat(maxDepth - depth);
      const operation = {"AND": "&", "OR": "|", "XOR": "^"}[operator];
      const s = `${result} = ${op1} ${operation} ${op2}`;
      console.log(indent + s);
      inspect(op1, depth - 1, maxDepth);
      inspect(op2, depth - 1, maxDepth);
    }
  }

  const checkZ = (z: string) => {
    const n = Number(z.slice(1));
    const curN = n.toString().padStart(2, "0");

    if (reverseConnections[z].operator !== "XOR") return false;
    const operands = [reverseConnections[z].op1, reverseConnections[z].op2].map(x => reverseConnections[x]);
    if (operands.some(x => x == undefined)) return false;
    if (!utils.arrayEquality(["OR", "XOR"], [operands[0].operator, operands[1].operator].sort())) return false;
    const xor = operands.find(x => x.operator === "XOR")!;
    // const or = operands.find(x => x.operator === "OR")!;

    if (!utils.arrayEquality([`x${curN}`, `y${curN}`], [xor.op1, xor.op2].sort())) {
      return false;
    }

    // This was enough to find all problematic operations for my input
    // I could have added more checks to make sure the operations are correct
    // such as adding a check for the or's "and" operand to make sure it has
    // x_{n-1} and y_{n-1} as operands
    // But I didn't need to do that for my input

    return true;
  }

  const sortedZs = Object.keys(reverseConnections).filter((key) => /z\d\d/.test(key)).sort();

  for (const out of sortedZs) {
    if (/z\d\d/.test(out) && !checkZ(out)) {
      console.log("\nThis operation is wrong", out);
      inspect(out);
    }
  }

  console.log("\n\n");
  console.log(`Unfortunately, I solved this problem by hand.
You can use the above inspections to find the problematic operations and swap the wires.
You'll have to edit the input file to see if you're correct.

(wires z00, z45 and (possibly) z01 get marked as wrong but they aren't full adders so they're false positives.)`);

  return;
};

const test = await getTests();
run({
  part1: {
    tests: [
      {
        input: test,
        expected: 2024,
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
