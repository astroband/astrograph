import { NQuads, NQuad, Subj } from "../nquads";

export abstract class Builder {
  protected nquads: NQuads = [];
  protected abstract current: Subj;
  protected prev: Subj | null = null;

  abstract build(): NQuads;

  protected pushValues(data: object) {
    for (let key in data) {
      this.pushValue(key, data[key]);
    }
  }

  protected pushValue(predicate: string, value: any) {
    this.nquads.push(
      new NQuad(this.current, predicate, NQuad.value(value))
    );
  }

  protected pushPreviousTx() {
    if (this.prev) {
      this.nquads.push(new NQuad(this.current, "prev", this.prev));
      this.nquads.push(new NQuad(this.prev, "next", this.current));
    }
  }
}
