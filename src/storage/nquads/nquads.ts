import { NQuad } from "./nquad";

export class NQuads extends Array<NQuad> {
  private index: Map<string, number> = new Map<string, number>();

  public push(...items: NQuad[]): number {
    for (const item of items) {
      const key = `${item.subject.type}-${item.subject.value}-${item.predicate}`;
      const index = this.index.get(key);

      if (!index) {
        super.push(item);
        this.index.set(key, this.indexOf(item));
        continue;
      }

      this[index] = item;
    }

    return this.length;
  }

  public concat(other: NQuads): NQuads {
    this.push(...other);
    return this;
  }
}
