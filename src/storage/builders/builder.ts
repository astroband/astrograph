import { NQuad, NQuads, Subj } from "../nquads";
import { LedgerBuilder } from "./ledger";

export abstract class Builder {
  public abstract readonly current: Subj;

  protected nquads: NQuads = [];
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
    if (value === undefined || value === null) {
      return;
    }

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

  protected pushLedger(seq: number) {
    this.nquads.push(new NQuad(this.current, "ledger", LedgerBuilder.keyNQuad(seq)));
  }

  protected pushBuilder(builder: Builder, key?: string, foreignKey?: string) {
    this.nquads.push(...builder.build());

    if (key) {
      this.nquads.push(new NQuad(this.current, key, builder.current));
    }

    if (foreignKey) {
      this.nquads.push(new NQuad(builder.current, foreignKey, this.current));
    }
  }
}
