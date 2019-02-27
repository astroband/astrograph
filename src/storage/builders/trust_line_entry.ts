import { IChange } from "../../changes_extractor";
import { ITrustLine } from "../../model";
import { makeKey } from "../../util/crypto";
import { toFloatAmountString } from "../../util/stellar";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AccountBuilder, AssetBuilder, Builder } from "./";

export class TrustLineEntryBuilder extends Builder {
  public static key(trustLine: ITrustLine, ledgerSeq: number, balance?: string) {
    return makeKey(
      "trust_line_entry",
      trustLine.asset.code,
      trustLine.asset.issuer || "",
      trustLine.accountID,
      balance || trustLine.balance,
      ledgerSeq
    );
  }

  public readonly current: IBlank;

  constructor(private trustLine: ITrustLine, change: IChange, private n: number) {
    super();
    this.current = NQuad.blank(TrustLineEntryBuilder.key(this.trustLine, change.seq));

    if (change.prevState) {
      this.prev = NQuad.blank(
        TrustLineEntryBuilder.key(
          this.trustLine,
          change.prevState.ledgerSeq,
          toFloatAmountString(change.prevState.balance)
        )
      );
    }
  }

  public build(): NQuads {
    this.pushKey();
    this.pushLink("account", AccountBuilder.key(this.trustLine.accountID));
    this.pushBuilder(new AssetBuilder(this.trustLine.asset), "asset");
    this.pushValues({
      "type.trust_line_entry": "",
      type: "trust_line_entry",
      balance: this.trustLine.balance,
      // we use ledger seq to order changes.
      // it's easier than try to sort by nested attribute ledger.seq
      // (I am not sure it's possible in dgraph at all)
      order: this.order(this.trustLine.lastModified, 0, 0, this.n)
    });
    this.pushLedger(this.trustLine.lastModified);
    this.pushPrev();
    return this.nquads;
  }
}
