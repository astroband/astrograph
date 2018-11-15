import { LedgerHeader } from "../../model";
import { makeKey } from "../../util/crypto";
import { IBlank, NQuad, NQuads } from "../nquads";
import { Builder } from "./builder";

export class LedgerBuilder extends Builder {
  public static key(seq: number) {
    return makeKey("ledger", seq.toString());
  }

  public readonly current: IBlank;
  protected seq: number;

  constructor(private header: LedgerHeader) {
    super();

    this.seq = this.header.ledgerSeq;
    this.current = NQuad.blank(LedgerBuilder.key(this.seq));
    this.prev = NQuad.blank(LedgerBuilder.key(this.seq - 1));
  }

  public build(): NQuads {
    const values = {
      type: "ledger",
      seq: this.seq,
      order: this.seq,
      version: this.header.ledgerVersion,
      base_fee: this.header.baseFee,
      base_reserve: this.header.baseReserve,
      max_tx_set_size: this.header.maxTxSetSize,
      close_time: this.header.closeTime.toISOString()
    };

    this.pushKey();
    this.pushPrev();
    this.pushValues(values);

    return this.nquads;
  }
}
