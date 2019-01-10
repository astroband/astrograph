import { IChange } from "../../changes_extractor";
import { ITrustLine } from "../../model2";
import { makeKey } from "../../util/crypto";
import { toFloatAmountString } from "../../util/stellar";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AccountBuilder } from "./account";
import { AssetBuilder } from "./asset";
import { Builder } from "./builder";

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
    this.pushBuilder(new AccountBuilder(this.trustLine.accountID), "account");
    this.pushBuilder(new AssetBuilder(this.trustLine.asset), "asset");
    this.pushValues({
      type: "trust_line_entry",
      balance: this.trustLine.balance,
      // we use ledger seq to order changes.
      // it's easier than try to sort by nested attribute ledger.seq
      // (I am not sure it's possible in dgraph at all)
      order: `${this.trustLine.lastModified}-${this.n}`
    });
    this.pushLedger(this.trustLine.lastModified);
    this.pushPrev();
    return this.nquads;
  }
}
