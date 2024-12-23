import run, { getTests } from "../deps.ts";

const parseInput = (rawInput: string) => {
  const edges = rawInput.trim().split("\n");
  const graph: { [vertex: string]: string[] } = {};

  edges.forEach((edge) => {
    const [a, b] = edge.split("-");

    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];

    graph[a].push(b);
    graph[b].push(a); // Since it's undirected
  });

  return graph;
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const triangles = new Set();

  for (const node in input) {
    const neighbors = input[node];

    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        const a = neighbors[i];
        const b = neighbors[j];

        if (input[a] && input[a].includes(b)) {
          if (![node, a, b].some((n) => n.startsWith("t"))) continue;

          const triangle = [node, a, b].sort().join("-");
          triangles.add(triangle);
        }
      }
    }
  }

  return triangles.size;
};

const part2 = (rawInput: string) => {
  const graph = parseInput(rawInput);

  function bronKerbosch(clique: string[], queue: string[], excluded: string[]): string[] {
    if (!queue.length && !excluded.length) {
      return clique;
    }

    let P = [...queue];
    let X = [...excluded];

    let cliques = [];

    for (const v of P) {
      const neighbors = graph[v];
      cliques.push(bronKerbosch([...clique, v], P.filter((x) => neighbors.includes(x)), X.filter((x) => neighbors.includes(x))));
      P = P.filter((x) => x !== v);
      X = [...X, v];
    }

    return cliques.sort((a, b) => b.length - a.length)[0];
  }

  function findMaxClique(graph: ReturnType<typeof parseInput>): string[] {
    return bronKerbosch([], Object.keys(graph), []);
  }

  return findMaxClique(graph).sort().join(",");
};

const test = await getTests();
run({
  part1: {
    tests: [
      {
        input: test,
        expected: 7,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: test,
        expected: "co,de,ka,ta",
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});
