import { Node, Vector } from "./utils.ts";

export type Position = { x: number, y: number };

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

  set(x: number, y: number, value: T): void {
    this._data[y][x] = value;
  }

  get(x: number, y: number): T | null {
    return this._data[y]?.[x];
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

  findIndex(predicate: (value: T, x: number, y: number) => boolean): Position | null {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (predicate(this.get(x, y)!, x, y)) {
          return { x, y };
        }
      }
    }

    return null;
  }

  allPositionsWhere(predicate: (value: T, x: number, y: number) => boolean): Position[] {
    const positions: Position[] = [];

    this.forEach((value, x, y) => {
      if (predicate(value, x, y)) {
        positions.push({ x, y });
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
}