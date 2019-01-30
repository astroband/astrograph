import { NQuad } from "./nquad";

export class NQuads extends Array<NQuad> {
  public push(...items: NQuad[]): number {
    // prettier-ignore
    for (let i = 0; i < items.length; i++) {
      let n = 0;
      const item = items[i];

      // prettier-ignore
      for (n = 0; n < this.length; n++) {
        if (this[n].key === item.key) {
          break;
        }
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
