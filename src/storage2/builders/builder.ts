import { NQuad, NQuads, Subj } from "../nquads";

export abstract class Builder {
  protected nquads: NQuads = [];
  public readonly abstract current: Subj;
  protected prev: Subj | null = null;

  public abstract build(): NQuads;

  protected pushValues(data: object) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        this.pushValue(key, data[key]);
      }
    }
  }

  protected pushValue(predicate: string, value: any) {
    this.nquads.push(new NQuad(this.current, predicate, NQuad.value(value)));
  }

  protected pushKey() {
    this.pushValue("key", this.current.value);
  }

  protected pushPrev() {
    if (this.prev) {
      this.nquads.push(new NQuad(this.current, "prev", this.prev));
      this.nquads.push(new NQuad(this.prev, "next", this.current));
    }
  }
}
