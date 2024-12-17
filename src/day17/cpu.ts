import { mod } from "../utils.ts";

export default class CPU {
  private out: number[] = [];

  public a: number = 0;
  public b: number = 0;
  public c: number = 0;

  reset(a: number, b: number, c: number) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  private combo(num: number) {
    if (num >= 0 && num <= 3) return num;
    if (num == 4) return this.a;
    if (num == 5) return this.b;
    if (num == 6) return this.c;

    throw new Error(`Unknown combo: ${num}`);
  }

  public run(program: number[]) {
    let pc = 0;

    while (pc < program.length) {
      const opcode = program[pc];
      const literal = program[pc + 1];

      switch (opcode) {
        case 0:
          this.a = Math.trunc(this.a / (2**this.combo(literal)));
          break;
        case 1:
          this.b = this.b ^ literal;
          break;
        case 2:
          this.b = mod(this.combo(literal), 8);
          break;
        case 3:
          if (this.a == 0) break;
          pc = literal;
          continue;
        case 4:
          this.b = this.b ^ this.c;
          break;
        case 5:
          this.out.push(mod(this.combo(literal), 8));
          break;
        case 6:
          this.b = Math.trunc(this.a / (2**this.combo(literal)));
          break;
        case 7:
          this.c = Math.trunc(this.a / (2**this.combo(literal)));
          break;
        default:
          throw new Error(`Unknown opcode: ${opcode}`);
      }

      pc += 2;
    }

    return this.out;
  }
}