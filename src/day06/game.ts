import Grid, { Position } from "../grid.ts";

export class GameGrid extends Grid<string> {
  private guardPosition: Position = { x: 0, y: 0 };
  private currentDirection = 0;
  private visitedPositions = new Set<string>();
  private visitedDirections = new Set<string>();

  constructor(data: string[][]) {
    super(data[0].length, data.length, "");

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.set(x, y, data[y][x]);
      }
    }

    this.guardPosition = this.findIndex((value) => value === "^")!;
  }

  advanceGuard(): boolean {
    const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];

    let x = this.guardPosition.x;
    let y = this.guardPosition.y;

    x += directions[this.currentDirection][0];
    y += directions[this.currentDirection][1];

    if (this.isOutOfBounds(x, y)) {
      return false;
    }

    if (this.get(x, y) === "#") {
      // Backtrack
      x -= directions[this.currentDirection][0];
      y -= directions[this.currentDirection][1];
      this.currentDirection = (this.currentDirection + 1) % directions.length;
    } else {
      this.guardPosition = { x, y };
    }

    return true;
  }

  checkGuard() {
    this.visitedPositions.add(`${this.guardPosition.x},${this.guardPosition.y}`);
    this.visitedDirections.add(`${this.guardPosition.x},${this.guardPosition.y},${this.currentDirection}`);
  }

  advanceGuardAndCheck(): boolean {
    const result = this.advanceGuard();
    this.checkGuard();
    return result;
  }

  *[Symbol.iterator]() {
    while (true) {
      if (!this.advanceGuard()) break;
      yield this.guardPosition;
      this.checkGuard();
    }
  }

  hasVisited(x: number, y: number): boolean {
    return this.visitedPositions.has(`${x},${y}`);
  }

  getVisitedCount(): number {
    return this.visitedPositions.size;
  }

  loopsForever(): boolean {
    return this.visitedDirections.has(`${this.guardPosition.x},${this.guardPosition.y},${this.currentDirection}`);
  }

  withNewObstacle(x: number, y: number): GameGrid {
    const newGrid = new GameGrid(this.toArray());

    newGrid.set(x, y, "#");
    newGrid.guardPosition = this.guardPosition;
    newGrid.currentDirection = this.currentDirection;
    newGrid.visitedPositions = new Set(this.visitedPositions);
    newGrid.visitedDirections = new Set(this.visitedDirections);

    return newGrid;
  }

  wouldLoop(iterations = 100000): boolean {
    for (const _ of this) {
      if (iterations-- === 0) {
        return false;
      }

      if (this.loopsForever()) {
        return true;
      }
    }

    return false;
  }
}