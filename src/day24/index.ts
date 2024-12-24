import run, { getTests } from "../deps.ts";
import * as utils from "../utils.ts";

type Operator = "AND" | "OR" | "XOR";
type Connection = { op1: string, operator: Operator, op2: string, result: string };
type Input = { initial: Record<string, number>, connections: Connection[] };

const parseInput = (rawInput: string): Input => {
  const [initial, connections] = rawInput.trim().split("\n\n");
  return {
    initial: initial.split("\n").map((line) => line.split(": ")).reduce((acc, [key, value]) => ({ ...acc, [key]: +value }), {}) as Record<string, number>,
    connections: connections.split("\n").map((line) => {
      const [operation, output] = line.split(" -> ");
      return [operation.split(" "), output] as [string[], string];
    }).map(([[op1, operator, op2], result]) => ({ op1, operator: operator as Operator, op2, result })),
  };
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  return compute(input.initial, input.connections)[2];
};

const compute = (initial: Record<string, number>, connections: Connection[]): [x: number, y: number, z: number] => {
  const wires = { ...initial };
  const queue = connections.slice();

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

  return ['x', 'y', 'z'].map((wire) => {
    const keys = Object.keys(wires).filter((key) => new RegExp(`${wire}\\d\\d`).test(key)).sort().reverse();
    return keys.reduce((acc, key) => {
      return (acc * 2) + (wires[key] ?? 0);
    }, 0);
  }) as [x: number, y: number, z: number];
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const reverseConnections = input.connections.reduce((acc, conn) => {
    acc[conn.result] = conn;
    return acc;
  }, {} as Record<string, Connection>);

  // First part as described in https://www.reddit.com/1hla5ql
  const rule1 = Object.values(reverseConnections).filter((connection) => {
    const { operator, result } = connection;
    return /z(?:[0-3]\d|4[0-4])/.test(result) && operator !== "XOR";
  });
  const rule2 = Object.values(reverseConnections).filter((connection) => {
    const { op1, operator, op2, result } = connection;
    return !/[xy]\d\d/.test(op1) && !/[xy]\d\d/.test(op2) && !/z\d\d/.test(result) && operator === "XOR";
  });

  const relativeOutput = (node: string): string | null => {
    if (/z\d\d/.test(node)) {
      return node;
    }
    const filtered = Object.values(reverseConnections)
      .filter((connection) => connection.op1 === node || connection.op2 === node);
    const res = filtered.find((connection) => /z\d\d/.test(connection.result))?.result;
    if (res) return "z" + (Number(res.slice(1)) - 1);
    return filtered.map((connection) => relativeOutput(connection.result)).filter(res => res)[0];
  }

  const swap = (node: string, relOut: string) => {
    const temp = reverseConnections[node];
    reverseConnections[node] = { ...reverseConnections[relOut], result: node };
    reverseConnections[relOut] = { ...temp, result: relOut };
  }

  for (const { result } of rule2) {
    const relOut = relativeOutput(result);
    swap(result, relOut!);
  }

  const checkZ = (z: string) => {
    const n = Number(z.slice(1));
    const curN = n.toString().padStart(2, "0");

    if (!reverseConnections[z] || reverseConnections[z].result !== z) return false;

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

  // Get the last erroring output value, ignoring z00, z01 and z45 (the check function expects full adders)
  const erroring = new utils.Range(2, 44).map(n => `z${n.toString().padStart(2, "0")}`).filter(z => !checkZ(z))[0];
  const number = Number(erroring.slice(1));
  // We just need to swap the output of xXX AND yXX and xXX XOR yXX
  // ie. we need to swap the sum and output bits of adder #XX
  const affectedWires = Object.values(reverseConnections).filter(x => {
    return utils.arrayEquality([`x${number.toString().padStart(2, "0")}`, `y${number.toString().padStart(2, "0")}`], [x.op1, x.op2].sort());
  });

  return [...rule1, ...rule2, ...affectedWires].map(r => r.result).sort().join();
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
