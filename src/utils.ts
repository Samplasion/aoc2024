import Grid, { Position } from "./grid.ts";

export function create2DArray<T>(width: number, height: number, value: T): T[][] {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => value));
}

export function combinationsOf<T>(elements: T[], length: number): T[][] {
  if (length === 0) {
    return [[]];
  }

  const result: T[][] = [];
  
  for (const element of elements) {
    for (const combination of combinationsOf(elements, length - 1)) {
      result.push([element, ...combination]);
    }
  }

  return result;
}

export function mod(v: number, n: number) {
  return ((v % n) + n) % n;
}

export function sum(arr: number[]): number {
  return arr.reduce((acc, v) => acc + v, 0);
}

export function swap<T>(arr: T[], i: number, j: number) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

export function lastIndexWhere<T>(arr: T[], predicate: (v: T) => boolean, startingFrom?: number): number {
  for (let i = startingFrom ?? (arr.length - 1); i >= 0; i--) {
    if (predicate(arr[i])) {
      return i;
    }
  }

  return -1;
}

export function arrayIntersection<T>(a: T[], b: T[]): T[] {
  return a.filter((v) => b.includes(v));
}

export function arrayEquality<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function transpose<T>(matrix: T[][]): T[][] {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

export function occurrences<T>(arr: T[]): Map<T, number> {
  return arr.reduce((acc, v) => acc.set(v, (acc.get(v) ?? 0) + 1), new Map<T, number>());
}

// #region Vector
export class Vector {
  constructor(public x: number, public y: number) {}

  static DIRECTIONS = "NESW".split("").map(l => this.from(l)!);
  static from(letter: string) {
      switch (letter) {
          case "N":
          case "U":
          case "^":
              return new Vector(0, 1);
          case "S":
          case "D":
          case "v":
              return new Vector(0, -1);
          case "E":
          case "R":
          case ">":
              return new Vector(1, 0);
          case "W":
          case "L":
          case "<":
              return new Vector(-1, 0);
      }
  }

  static parse(string: string) {
      if (!/\(\d+,\d+\)/.test(string)) throw new SyntaxError();
      const [x, y] = string.slice(1, -1).split(",").map(toInt);
      return new Vector(x, y);
  }

  static intermediate(from: Vector, to: Vector) {
      const positions: Vector[] = [];
      const [fromX, toX] = [Math.min(from.x, to.x), Math.max(from.x, to.x)];
      const [fromY, toY] = [Math.min(from.y, to.y), Math.max(from.y, to.y)];
      for (let x = fromX; x <= toX; x++)
          for (let y = fromY; y <= toY; y++)
              positions.push(new Vector(x, y));
      return positions;
  }

  static fromPosition(pos: Position) {
      return new Vector(pos.x, pos.y);
  }

  get sqmag() {
      return this.x ** 2 + this.y ** 2
  }

  get mag() {
      return Math.sqrt(this.sqmag);
  }

  get quadrant() {
      if (this.x < 0)
          return this.y < 0 ? 3 : 2;
      else
          return this.y < 0 ? 4 : 1;
  }

  get direction() {
      if (this.x != 0 && this.y != 0)
          return null;
      if (this.x == 0)
          return this.y > 0 ? "N" : "S";
      else
          return this.x > 0 ? "E" : "W";
  }

  get unit() {
      return new Vector(
          this.x / this.mag,
          this.y / this.mag,
      );
  }

  get tuple() {
      return [this.x, this.y];
  }

  get isVertical() {
    return this.x == 0;
  }

  get isHorizontal() {
    return this.y == 0;
  }

  add(vec: Vector): Vector {
      return new Vector(this.x + vec.x, this.y + vec.y);
  }

  subtract(vec: Vector): Vector {
      return this.add(vec.neg());
  }

  manhattanDistance(vec: Vector) {
      const deltaX = vec.x - this.x;
      const deltaY = vec.y - this.y;
      return Math.abs(deltaX) + Math.abs(deltaY);
  }

  isAdjacentTo(vec: Vector) {
      return Math.sqrt((vec.x - this.x) ** 2 + (vec.y - this.y) ** 2) < 2;
  }

  isCollinearTo(vec: Vector) {
      return this.x == vec.x || this.y == vec.y;
  }

  neg() {
      return new Vector(-this.x, -this.y);
  }

  gt(other: Vector) {
      return other.mag < this.mag;
  }

  eq(other: Vector) {
      return this.x === other.x && this.y === other.y;
  }

  clone() {
      return new Vector(this.x, this.y);
  }

  get [Symbol.toStringTag]() {
      return "Vector";
  }
  
  toString() {
      return `(${this.x}; ${this.y})`
  }

  getIn<T>(grid: T[][]): T | null {
      return grid[this.x]?.[this.y];
  }

  flipX(): Vector {
    return new Vector(-this.x, this.y);
  }

  flipY(): Vector {
    return new Vector(this.x, -this.y);
  }
}
// #endregion

// #region BFS
export interface Node<T> {
  position: Vector,
  value: T,
}
export type DistancedNode<T> = [node: Node<T>, distance: number];
export type BFSMatcher<T> = (a: Node<T>, b: Node<T>) => boolean;
export type BFSCallback<T> = (node: Node<T>, queue: DistancedNode<T>[]) => boolean;
export interface BFSParameters<T> {
  matcher: BFSMatcher<T>,
  startPosition: Vector,
  endPosition?: Vector,
  endCondition?: BFSCallback<T>,
}

export function toNodes<T>(grid: T[][]): Node<T>[][] {
  const result = <Node<T>[][]>[];

  for (let i = 0; i < grid.length; i++) {
    result[i] = [];
    for (let j = 0; j < grid[i].length; j++) {
      result[i].push({ position: new Vector(i, j), value: grid[i][j] });
    }
  }

  return result;
}

export function bfs<T>(grid: Node<T>[][], { matcher, startPosition, endPosition, endCondition }: BFSParameters<T>): number;
export function bfs<T>(grid: Grid<T>, { matcher, startPosition, endPosition, endCondition }: BFSParameters<T>): number;
export function bfs<T>(grid: Node<T>[][] | Grid<T>, { matcher, startPosition, endPosition, endCondition }: BFSParameters<T>): number {
  if (grid instanceof Grid) {
      grid = toNodes(grid.toArray());
  }

  if (endPosition == null && endCondition == null)
      throw new Error("Either endPosition or endCondition must not be null");

  // Set of positions
  const visited: Set<string> = new Set([startPosition.toString()]);
  const q: DistancedNode<T>[] = [[startPosition.getIn(grid)!, 0]];

  while (q.length != 0) {
      const el = q.shift()!;

      if ((endPosition != null && el[0].position.eq(endPosition)) || (endCondition != null && endCondition(el[0], q))) {
          return el[1];
      }

      Vector.DIRECTIONS.forEach(dir => {
          const target = el[0].position.add(dir);
          if (target.getIn(grid) != null && !visited.has(target.toString()) && matcher(el[0], target.getIn(grid)!)) {
              q.push([target.getIn(grid)!, el[1] + 1]);
              visited.add(target.toString());
          }
      });
  }

  return -1;
}

export function toInt(value: string) {
  return parseInt(value, 10);
}

export function getCellsAtDistance<T>(grid: T[][], pos: Vector, distance: number) {
  const cells: T[][] = [];

  for (let x = pos.x - distance; x <= pos.x + distance; x++) {
      const column: T[] = [];
      for (let y = pos.y - distance; y <= pos.y + distance; y++) {
          const current = new Vector(x, y);
          if (current.manhattanDistance(pos) <= distance)
              column.push(current.getIn(grid)!);
      }
      cells.push(column);
  }

  return cells;
}
// #endregion

interface RegionsParameters<T> {
  matcher: (v: Node<T>) => boolean,
}

export function* regionsIter<T>(grid: Node<T>[][] | Grid<T>, { matcher }: RegionsParameters<T>) {
  const visited: Set<string> = new Set();
  const nodes: Node<T>[][] = grid instanceof Grid ? grid.toNodes() : grid;
  const regions: Node<T>[][] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes[i].length; j++) {
      const pos = new Vector(i, j);
      if (!visited.has(pos.toString()) && matcher(nodes[i][j])) {
        regions.push([]);
        const q: Vector[] = [pos];
        while (q.length != 0) {
          const el = q.shift()!;
          if (!visited.has(el.toString())) {
            regions[regions.length - 1].push(nodes[el.x][el.y]);
          } else continue;
          visited.add(el.toString());
          Vector.DIRECTIONS.forEach(dir => {
            const target = el.add(dir);
            if (target.getIn(nodes) != null && !visited.has(target.toString()) && matcher(target.getIn(nodes)!)) {
              q.push(target);
            }
          });
        }
        yield regions[regions.length - 1];
      }
    }
  }

  return regions;
}

export function regions<T>(grid: Node<T>[][] | Grid<T>, { matcher }: RegionsParameters<T>): Node<T>[][] {
  return [...regionsIter(grid, { matcher })];
}

export function perimeter<T>(region: Node<T>[]) {
  const perimeter: Node<T>[] = [];
  const visited: Set<string> = new Set();

  for (const node of region.flat()) {
    const pos = node.position;
    Vector.DIRECTIONS.forEach(dir => {
      const target = pos.add(dir);
      if (!region.flat().some(n => n.position.eq(target))) {
        perimeter.push(node);
        visited.add(target.toString());
      }
    });
  }

  return perimeter;
}

/// Sides function as described in https://old.reddit.com/r/adventofcode/comments/1hcdnk0/2024_day_12_solutions/m1nujac/
// :(
export function sides<T>(nodes: Node<T>[]): number {
  const minX = Math.min(...nodes.map(n => n.position.x)),
        maxX = Math.max(...nodes.map(n => n.position.x)),
        minY = Math.min(...nodes.map(n => n.position.y)),
        maxY = Math.max(...nodes.map(n => n.position.y));
  
  const grid = new Grid<T | null>(maxX - minX + 1, maxY - minY + 1, null);
  nodes.forEach(n => grid.set(n.position.x - minX, n.position.y - minY, n.value));

  let edges = 0;

  for (let y = 0; y <= maxY - minY; y++) {
    let topWasEdge = false;
    let bottomWasEdge = false;
    
    for (let x = 0; x <= maxX - minX; x++) {
      const topIsEdge = grid.get(x, y) != null && grid.get(x, y - 1) == null;
      const bottomIsEdge = grid.get(x, y) != null && grid.get(x, y + 1) == null;

      if (topIsEdge && !topWasEdge) {
        edges++;
      }

      if (bottomIsEdge && !bottomWasEdge) {
        edges++;
      }

      topWasEdge = topIsEdge;
      bottomWasEdge = bottomIsEdge;
    }
  }

  for (let x = 0; x <= maxX - minX; x++) {
    let leftWasEdge = false;
    let rightWasEdge = false;
    
    for (let y = 0; y <= maxY - minY; y++) {
      const leftIsEdge = grid.get(x, y) != null && grid.get(x - 1, y) == null;
      const rightIsEdge = grid.get(x, y) != null && grid.get(x + 1, y) == null;

      if (leftIsEdge && !leftWasEdge) {
        edges++;
      }

      if (rightIsEdge && !rightWasEdge) {
        edges++;
      }

      leftWasEdge = leftIsEdge;
      rightWasEdge = rightIsEdge;
    }
  }

  return edges;
}

export class Fraction {
  private n: number;
  private d: number;

  constructor(n: number, d: number) {
    const gcd = this.gcd(n, d);
    [n, d] = [n / gcd, d / gcd];
    this.n = n;
    this.d = d;
  }

  static fromString(str: string) {
    const [n, d] = str.split("/").map(Number);
    return new Fraction(n, d);
  }

  reduce() {
    const gcd = this.gcd(this.n, this.d);
    return new Fraction(this.n / gcd, this.d / gcd);
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  add(f: Fraction) {
    return new Fraction(this.n * f.d + f.n * this.d, this.d * f.d).reduce();
  }

  sub(f: Fraction) {
    return new Fraction(this.n * f.d - f.n * this.d, this.d * f.d).reduce();
  }

  isInteger() {
    return this.d === 1;
  }

  toNumber() {
    return this.n / this.d;
  }
}