export class Ledger {
  public seq: number;

  constructor(seq: number) {
    this.seq = seq;
  }

  get id() {
    return this.seq;
  }
}
