import { NQuad } from "./nquad";

export class NQuads extends Array<NQuad> {
  private index: Map<string, number> = new Map<string, number>();

  public push(...items: NQuad[]): number {
    for (const item of items) {
      if (!item) {
        return this.length;
      }

      const n = this.index.get(item.key);

      if (n) {
        this[n] = item;
        continue;
      }

      this.index.set(item.key, this.length);
      this[this.length] = item;
    }
    return this.length;
  }

  public compact(): NQuads {
    return this.filter(el => el !== undefined) as NQuads;
  }

  public concat(other: NQuads): NQuads {
    this.push(...other);
    return this;
  }
}
