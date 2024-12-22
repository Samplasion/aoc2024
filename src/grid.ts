import { Node, Vector } from "./utils.ts";

export default class Grid<T> {
  private _data: T[][];

  constructor(width: number, height: number, value: T) {
    this._data = Array.from({ length: height }, () => Array.from({ length: width }, () => value));
  }

  static fromArray<T>(data: T[][]): Grid<T> {
    const grid = new Grid<T>(data[0].length, data.length, data[0][0]);

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        grid.set(x, y, data[y][x]);
      }
    }

    return grid;
  }

  static fromString<T>(data: string, mapper: (char: string) => T): Grid<T>;
  static fromString(data: string): Grid<string>;
  static fromString<T>(data: string, mapper?: (char: string) => T): Grid<T> {
    mapper ??= (char) => char as unknown as T;
    const lines = data.trim().split("\n");
    const grid = new Grid<T>(lines[0].length, lines.length, mapper(lines[0][0]));

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        grid.set(x, y, mapper(lines[y][x]));
      }
    }

    return grid;
  }

  get width(): number {
    return this._data[0].length;
  }

  get height(): number {
    return this._data.length;
  }

  clone(): Grid<T> {
    return Grid.fromArray(this.toArray());
  }

  set(x: number, y: number, value: T): void;
  set(pos: Vector, value: T): void;
  set(x: number | Vector, y: number | T, value?: T): void {
    if (x instanceof Vector) {
      this._data[x.y][x.x] = y as T;
      return;
    }

    this._data[y as number][x as number] = value!;
  }

  get(x: number, y: number): T | null;
  get(pos: Vector): T | null;
  get(x: number | Vector, y?: number): T | null {
    if (x instanceof Vector) {
      return this._data[x.y]?.[x.x];
    }
    
    return this._data[y!]?.[x];
  }

  mapGrid<U>(mapper: (value: T, x: number, y: number) => U): Grid<U> {
    const newGrid = new Grid<U>(this.width, this.height, mapper(this.get(0, 0)!, 0, 0));

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        newGrid.set(x, y, mapper(this.get(x, y)!, x, y));
      }
    }

    return newGrid;
  }

  map<U>(mapper: (value: T, x: number, y: number) => U): Array<U> {
    return this._data.flatMap((row, y) => row.map((value, x) => mapper(value, x, y)));
  }

  forEach(callback: (value: T, x: number, y: number) => void): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        callback(this.get(x, y)!, x, y);
      }
    }
  }

  findIndex(predicate: (value: T, x: number, y: number) => boolean): Vector | null {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (predicate(this.get(x, y)!, x, y)) {
          return new Vector(x, y);
        }
      }
    }

    return null;
  }

  find(value: T): Vector | null {
    return this.findIndex((v) => v === value);
  }

  allPositionsWhere(predicate: (value: T, x: number, y: number) => boolean): Vector[] {
    const positions: Vector[] = [];

    this.forEach((value, x, y) => {
      if (predicate(value, x, y)) {
        positions.push(new Vector(x, y));
      }
    });

    return positions;
  }

  toPrettyString(): string {
    let string = "";

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        string += (this.get(x, y) ?? " ").toString();
      }

      string += "\n";
    }

    return string;
  }

  isOutOfBounds(x: number, y: number): boolean {
    return x < 0 || x >= this.width || y < 0 || y >= this.height;
  }

  toArray(): T[][] {
    return this._data.map((row) => [...row]);
  }

  toNodes(): Node<T>[][] {
    return this._data.map((row, y) => row.map((value, x) => ({ position: new Vector(x, y), value })));
  }

  get positions(): Generator<Vector> {
    return (function* (grid: Grid<T>) {
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          yield new Vector(x, y);
        }
      }
    })(this);
  }

  neighbors(x: number, y: number): Generator<T>;
  neighbors(pos: Vector): Generator<T>;
  *neighbors(x: number | Vector, y?: number): Generator<T>{
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = x instanceof Vector ? x.x + dx : x + dx;
      const ny = x instanceof Vector ? x.y + dy : y! + dy;

      if (!this.isOutOfBounds(nx, ny)) {
        yield this.get(nx, ny)!;
      }
    }
  }

  getShortestPath(start: Vector, end: Vector, isWalkable: (value: T) => boolean): { distance: number; path: Vector[], distances: number[][] } | null {
    const rows = this.height;
    const cols = this.width;
    const directions = Vector.DIRECTIONS;
  
    const distance: number[][] = Array.from(
      { length: cols },
      () => Array(rows).fill(Infinity),
    );
    const previous: (Vector | null)[][] = Array.from(
      { length: cols },
      () => Array(rows).fill(null),
    );
    const visited: boolean[][] = Array.from(
      { length: cols },
      () => Array(rows).fill(false),
    );
  
    const queue: { point: Vector; dist: number }[] = [];
    distance[start.x][start.y] = 0;
    queue.push({ point: start, dist: 0 });
  
    while (queue.length > 0) {
      queue.sort((a, b) => a.dist - b.dist);
      const { point } = queue.shift()!;
      const { x, y } = point;
  
      if (visited[x][y]) continue;
      visited[x][y] = true;
  
      // We found the end; reconstruct the path
      if (x === end.x && y === end.y) {
        const path: Vector[] = [];
        let current: Vector | null = end;
  
        while (current) {
          path.push(current);
          current = previous[current.x][current.y];
        }
  
        return { distance: distance[end.x][end.y], path: path.reverse(), distances: distance };
      }
  
      for (const dir of directions) {
        const newX = x + dir.x;
        const newY = y + dir.y;
  
        if (!this.isOutOfBounds(newX, newY) && !visited[newX][newY]) {
          let adjacentWeight = 0;
  
          const previousP = new Vector(x, y);
          const current = new Vector(newX, newY);
  
          if (!isWalkable(this.get(newX, newY)!)) {
            adjacentWeight = Infinity;
          } else {
            adjacentWeight = 1;
          }
  
          const newDist = distance[x][y] + adjacentWeight;
  
          if (newDist < distance[newX][newY]) {
            distance[newX][newY] = newDist;
            previous[newX][newY] = previousP;
            queue.push({ point: current, dist: newDist });
          }
        }
      }
    }
  
    return null;
  }

  getAllPaths(start: Vector, end: Vector, isWalkable: (value: T) => boolean): Vector[][] {
    const queue = [{ pos: start, path: [] as Vector[] }];
    const distances: { [key: string]: number } = {};

    if (start === end) return [[end]];

    const allPaths: Vector[][] = [];
    while (queue.length) {
      const current = queue.shift();
      if (current === undefined) break;

      if (current.pos.x === end.x && current.pos.y === end.y) {
        allPaths.push([...current.path, current.pos]);
        continue;
      }
      if (distances[`${current.pos.x},${current.pos.y}`] !== undefined && distances[`${current.pos.x},${current.pos.y}`] < current.path.length) continue;

      Vector.DIRECTIONS.forEach((direction) => {
        const position = current.pos.add(direction);

        if (this.isOutOfBounds(position.x, position.y)) return;
        if (!isWalkable(this.get(position)!)) return;

        const newPath = [...current.path, current.pos];
        if (distances[`${position.x},${position.y}`] === undefined || distances[`${position.x},${position.y}`] >= newPath.length) {
          queue.push({ pos: position, path: newPath });
          distances[`${position.x},${position.y}`] = newPath.length;
        }

        // const button = Object.values(t).find(button => button.x === position.x && button.y === position.y);
        // if (button !== undefined) {
        //     const newPath = current.path + direction;
        //     if (distances[`${position.x},${position.y}`] === undefined || distances[`${position.x},${position.y}`] >= newPath.length) {
        //         queue.push({ ...position, path: newPath });
        //         distances[`${position.x},${position.y}`] = newPath.length;
        //     }
        // }
      });
    }

    return allPaths.sort((a, b) => a.length - b.length);
  }
}