import { mod, Vector } from "../utils.ts";

export interface Robot {
  position: Vector,
  velocity: Vector,
}

export class Game {
  private robots: Robot[];
  private width: number;
  private height: number;
  private time = 0;

  constructor(robots: Robot[], width: number, height: number) {
    this.robots = robots;
    this.width = width;
    this.height = height;
    for (const robot of this.robots) {
      robot.position.x = mod(robot.position.x, this.width);
      robot.position.y = mod(robot.position.y, this.height);
    }
  }

  tick() {
    this.time++;
    for (const robot of this.robots) {
      robot.position = robot.position.add(robot.velocity);
      robot.position.x = mod(robot.position.x, this.width);
      robot.position.y = mod(robot.position.y, this.height);
    }
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.width * this.height; i++) {
      this.tick();
      yield this.robots;
    }
  }

  part1() {
    const robots = {
      "I": 0,
      "II": 0,
      "III": 0,
      "IV": 0,
    };

    for (let x = 0; x < this.width; x++) {
      if (x == (this.width - 1) / 2) continue;
      
      for (let y = 0; y < this.height; y++) {
        if (y == (this.height - 1) / 2) continue;

        const quadrant = x < (this.width - 1) / 2 ? (y < (this.height - 1) / 2 ? "I" : "II") : (y < (this.height - 1) / 2 ? "III" : "IV");

        const robotsThere = this.robots.filter((robot) => robot.position.x == x && robot.position.y == y);
        robots[quadrant] += robotsThere.length;
      }
    }

    return Object.values(robots).reduce((acc, count) => acc * count, 1);
  }

  print(hideMiddles = true) {
    const grid = Array.from({ length: this.height }, () => Array.from({ length: this.width }, () => "."));
    for (const robot of this.robots) {
      grid[robot.position.y][robot.position.x] = "#";
    }

    if (hideMiddles) {
      for (let y = 0; y < this.height; y++) {
        grid[y][(this.width - 1) / 2] = " ";
      }

      for (let x = 0; x < this.width; x++) {
        grid[(this.height - 1) / 2][x] = " ";
      }
    }

    console.log(grid.map((row) => row.join("")).join("\n"));
  }

  part2() {
    for (const state of this) {
      const positions = state.map((robot) => robot.position);

      for (let y = 0; y < this.height; y++) {
        const row = positions.filter((position) => position.y == y).map(pos => pos.x).sort((a, b) => a - b);
        const longestLine = row.reduce((acc, x, i) => {
          if (i == 0) return { length: 1, start: x, end: x };
          if (x == row[i - 1] + 1) {
            return { length: acc.length + 1, start: acc.start, end: x };
          }
          return { length: 1, start: x, end: x };
        }, { length: 0, start: 0, end: 0 });
        if (longestLine.length >= 10) {
          return this.time;
        }
      }
    }
    throw "Too long";
  }
}