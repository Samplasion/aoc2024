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

  function isClique(size: number, vertices: string[] = []) {
    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        if (!graph[vertices[i]].includes(vertices[j])) {
          return false;
        }
      }
    }
    return true;
  }

  function maxCliques(i: number, l: number, cliqueVertices: string[], graphVertices: string[]) {
    const examined: string[] = [...cliqueVertices];
    let max = l;
    let maxVertices = [...cliqueVertices];

    for (let j = i + 1; j < graphVertices.length; j++) {
      examined[l] = graphVertices[j];

      if (isClique(l + 1, examined)) {
        const nextIter = maxCliques(j, l + 1, examined, graphVertices);
        if (nextIter.max > max) {
          max = nextIter.max;
          maxVertices = nextIter.vertices;
        }
      }
    }
    return {
      max,
      vertices: maxVertices,
    }
  }

  function findMaxClique(graph: ReturnType<typeof parseInput>) {
    const graphVertices = Object.keys(graph);
    let maxCliqueSize = 0;

    let result: string[] = [];

    for (let i = 0; i < graphVertices.length; i++) {
      const vertices = [graphVertices[i]];
      const nextIter = maxCliques(i, 1, vertices, graphVertices);
      if (nextIter.max > maxCliqueSize && nextIter.vertices.some(v => v.startsWith("t"))) {
        maxCliqueSize = nextIter.max;
        result = nextIter.vertices;
      }
    }
    return result;
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
