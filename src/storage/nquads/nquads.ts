import { NQuad } from "./nquad";

export class NQuads extends Array<NQuad> {
  private index: string[] = []; // Map<string, number> = new Map<string, number>();

  public push(...items: NQuad[]): number {
    for (const item of items) {
      const key = item.key();
      const n = this.index.indexOf(key);

      if (n < 0) {
        this[this.length] = item;
        this.index[this.length - 1] = key;
        continue;
      }

      this[n] = item;
    }

    return this.length;
  }

  public concat(other: NQuads): NQuads {
    this.push(...other);
    return this;
  }
}
