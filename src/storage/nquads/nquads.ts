import { NQuad } from "./nquad";

export class NQuads extends Array<NQuad> {
  private index: Map<string, number> = new Map<string, number>();

  public push(...items: NQuad[]): number {
    for (const item of items) {
      const key = `${item.subject}-${item.predicate}`;
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
}
