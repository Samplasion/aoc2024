import Grid from "./grid.ts";

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
    if (!/\(\d+(?:,|;) ?\d+\)/.test(string)) throw new SyntaxError();
    const [x, y] = string.slice(1, -1).split(/(,|;) ?/).map(toInt);
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

  multiply(lambda: number): Vector {
    return new Vector(this.x * lambda, this.y * lambda);
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
    return grid[this.y]?.[this.x];
  }

  flipX(): Vector {
    return new Vector(-this.x, this.y);
  }

  flipY(): Vector {
    return new Vector(this.x, -this.y);
  }

  rotateSquare(turns: number): Vector {
    turns = mod(turns, 4);

    switch (turns) {
      case 1: return new Vector(-this.y, this.x);
      case 2: return this.neg();
      case 3: return new Vector(this.y, -this.x);
    }

    return this.clone();
  }
}
// #endregion

// #region BFS
export interface Node<T> {
  position: Vector,
  value: T,
}
export type DistancedNode<T> = [node: Node<T>, distance: number];
export type PathTrackingNode<T> = [node: Node<T>, distance: number, path: Node<T>[]];
export type BFSMatcher<T> = (a: Node<T>, b: Node<T>) => boolean;
export type BFSCallback<T, C = DistancedNode<T>> = (node: Node<T>, queue: C[]) => boolean;
export interface BFSParameters<T, C = DistancedNode<T>> {
  matcher: BFSMatcher<T>,
  startPosition: Vector,
  endPosition?: Vector,
  endCondition?: BFSCallback<T, C>,
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

export class PriorityQueue<T> {
  private data: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  push(value: T) {
    this.data.push(value);
    this.data.sort(this.comparator);
  }

  pop() {
    return this.data.shift();
  }

  peek(): T | undefined {
    return this.data[0];
  }

  get length() {
    return this.data.length;
  }

  get isEmpty() { return this.length === 0; }
  get isNotEmpty() { return this.length !== 0; }
}

type RangeCallback<T = void> = (index: number) => T;
export class Range {
  from: number;
  to: number;
  step: number;

  constructor(from: number, to?: number, step = 1) {
    if (to == null) {
      this.from = 0;
      this.to = from;
    } else {
      this.from = from;
      this.to = to;
    }
    this.step = ~~step;
  }

  get size() {
    return Math.ceil((this.to - this.from) / this.step);
  }

  withStep(step: number) {
    return new Range(this.from, this.to, step);
  }

  toArray() {
    const result: number[] = [];
    this.forEach(result.push.bind(result));
    return result;
  }

  forEach(callback: RangeCallback) {
    if (this.step > 0)
      for (let i = this.from; i < this.to; i += this.step)
        callback(i);
    else {
      // this.step < 0
      // deno-lint-ignore for-direction
      for (let i = this.from; i > this.to; i += this.step)
        callback(i);
    }
  }

  map<U>(callback: RangeCallback<U>) {
    const result: U[] = [];
    this.forEach(i => result.push(callback(i)));
    return result;
  }

  contains(num: number) {
    return num >= this.from && num < this.to;
  }

  *[Symbol.iterator]() {
    if (this.step > 0) {
      for (let i = this.from; i < this.to; i += this.step)
        yield i;
    } else {
      // this.step < 0
      // deno-lint-ignore for-direction
      for (let i = this.from; i > this.to; i += this.step)
        yield i;
    }
  }
}

export function memoize<T, U>(fn: (arg: T) => U): (arg: T) => U {
  const cache = new Map<T, U>();
  return (arg: T) => {
    if (!cache.has(arg)) {
      cache.set(arg, fn(arg));
    }
    return cache.get(arg)!;
  };
}
export function memoize2<T1, T2, U>(fn: (arg1: T1, arg2: T2) => U): (arg1: T1, arg2: T2) => U {
  const cache = new Map<string, U>();
  return (arg1: T1, arg2: T2) => {
    const key = `${arg1},${arg2}`;
    if (!cache.has(key)) {
      cache.set(key, fn(arg1, arg2));
    }
    return cache.get(key)!;
  };
}

export type EqualityCheck<T> = (a: T, b: T) => boolean;
export function unique<T>(elements: T[], areEqual?: EqualityCheck<T>): T[] {
  if (areEqual) {
    const result: T[] = [];
    elements.forEach(element => {
      if (!result.some((t) => areEqual(element, t))) {
        result.push(element);
      }
    });
    return result;
  }
  return [...new Set<T>(elements)];
}

/**
 * Returns the first layer of positions just outside the
 * area accessible by [position] at Manhattan distance [disance].
 * @param position The center of the circle/diamond
 * @param distance The distance between the outer layer of the inside of the diamond and the center
 * @example
 * The area marked with `-` is the area accessible by C at distance 2.
 * This function returns the positions marked by #.
 * 
 *   012345678
 * 0 .........
 * 1 ....#....
 * 2 ...#-#...
 * 3 ..#---#..
 * 4 .#--C--#.
 * 5 ..#---#..
 * 6 ...#-#...
 * 7 ....#....
 * 8 .........
 */
export function manhattanCircle(position: Vector, distance: number): Vector[] {
  const results: Vector[] = [];
  let rendezvous = false;
  for (let dx = 0, y = position.y - distance - 1; dx >= 0; rendezvous ? dx-- : dx++, y++) {
    results.push(new Vector(position.x - dx, y));
    results.push(new Vector(position.x + dx, y));
    if (y == position.y) rendezvous = true;
  }
  // No point in checking every item for uniqueness if the results are many
  if (results.length > 1e4) return results;
  return unique(results, (a, b) => a.eq(b));
}

export function manhattanCircumference(position: Vector, distance: number): Vector[] {
  const results: Vector[] = [];
  for (let i = 1; i <= distance; i++) {
    results.push(...manhattanCircle(position, i));
  }
  return results;
}

export function max(i: Iterable<number>): number {
  let max = -Infinity;
  for (const n of i) {
    if (n > max) {
      max = n;
    }
  }
  return max;
}

export function* pairwiseCombinations<T>(arr: T[]): Generator<[T, T]> {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (i == j) continue;
      yield [arr[i], arr[j]];
    }
  }
}