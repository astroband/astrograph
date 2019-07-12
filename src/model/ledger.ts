import { LedgerHeader } from "../orm/entities";

export class Ledger {
  constructor(public readonly seq: number, public readonly header?: LedgerHeader) {}

  get id() {
    return this.seq;
  }
}
