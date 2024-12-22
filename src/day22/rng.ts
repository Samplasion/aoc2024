export default class RNG {
  constructor(public seed: number) {}

  next(): number {
    this.mix(this.seed << 6);
    this.prune();

    this.mix(this.seed >> 5);
    this.prune();

    this.mix(this.seed << 11);
    this.prune();

    return this.seed;
  }

  private mix(x: number) {
    this.seed ^= x;
  }

  private prune() {
    this.seed &= (1 << 24) - 1;
  }
}