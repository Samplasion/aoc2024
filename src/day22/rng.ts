export default class RNG {
  constructor(public seed: number) {}

  next(): number {
    this.mix(this.seed * 64);
    this.prune();

    this.mix(Math.floor(this.seed / 32));
    this.prune();

    this.mix(this.seed * 2048);
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