export default class Stones {
  private stones: Map<number, number>;

  constructor(stones: number[]) {
    this.stones = new Map(stones.map((x) => [x, 1]));
  }

  blink() {
    const entries = [...this.stones.entries()];
    for (const [stone, count] of entries) {
      this.stones.set(stone, this.stones.get(stone)! - count);
      if (stone == 0) {
        this.stones.set(1, (this.stones.get(1) ?? 0) + count);
      } else if (~~(Math.log10(stone) + 1) % 2 == 0) {
        const digits = ~~(Math.log10(stone) + 1);
        const divisor = Math.pow(10, digits / 2);
        const left = ~~(stone / divisor);
        const right = stone % divisor;

        this.stones.set(left, (this.stones.get(left) ?? 0) + count);
        this.stones.set(right, (this.stones.get(right) ?? 0) + count);
      } else {
        const newStone = stone * 2024;
        this.stones.set(newStone, (this.stones.get(newStone) ?? 0) + count);
      }
    }
  }

  [Symbol.toPrimitive]() {
    return "Stones";
  }

  getSize() {
    return this.stones.entries().reduce((acc, [_, count]) => acc + count, 0);
  }
}