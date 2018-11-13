import { LedgerHeader } from "../../model";
import { makeKey } from "../../util/crypto";
import { NQuad, NQuads } from "../nquads";
// import { Connection } from "../connection";
// import { Writer } from "./writer";

// extends Writer

export class LedgerBuilder {
  constructor(private header: LedgerHeader) { }

  public static build(header: LedgerHeader) {
    const builder = new LedgerBuilder(header);
    return builder.build();
  }

  public build(): NQuads {
    const seq = this.header.ledgerSeq;

    const current = NQuad.blank(LedgerBuilder.key(seq));
    const prev = NQuad.blank(LedgerBuilder.key(seq - 1));

    return [
      new NQuad(current, "key", NQuad.value(current.value)),
      new NQuad(current, "prev", prev),
      new NQuad(prev, "next", current),
      new NQuad(current, "type", NQuad.value("ledger")),
      new NQuad(current, "seq", NQuad.value(seq)),
      new NQuad(current, "order", NQuad.value(seq)),
      new NQuad(current, "version", NQuad.value(this.header.ledgerVersion)),
      new NQuad(current, "base_fee", NQuad.value(this.header.baseFee)),
      new NQuad(current, "base_reserver", NQuad.value(this.header.baseReserve)),
      new NQuad(current, "max_tx_set_size", NQuad.value(this.header.maxTxSetSize)),
      new NQuad(current, "close_time", NQuad.value(this.header.closeTime.toISOString()))
    ];
  }

  public static key(seq: number) {
    return makeKey("ledger", seq.toString());
  }
}
