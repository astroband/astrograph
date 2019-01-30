import Big from "big.js";
import { NQuad, NQuads, Subj } from "../nquads";
import { LedgerBuilder } from "./";

const LEDGER_POW = Big(10).pow(9);
const TX_POW = Big(10).pow(5);
const OP_POW = Big(10).pow(2);
const N_POW = 1;

export abstract class Builder {
  public abstract readonly current: Subj;

  protected nquads: NQuads = new NQuads();
  protected prev: Subj | null = null;

  constructor() {
    this.nquads.length = 100;
  }

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

  protected order(ledger: number, tx: number = 0, op: number = 0, n: number = 0): string {
    return Big(ledger)
      .times(LEDGER_POW)
      .plus(Big(tx).times(TX_POW))
      .plus(Big(op).times(OP_POW))
      .plus(Big(n).times(N_POW))
      .toString();
  }
}
