import { ITrustLine } from "../../model/trust_line";
import { makeKey } from "../../util/crypto";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AccountBuilder } from "./account";
import { AssetBuilder } from "./asset";
import { Builder } from "./builder";

export class TrustLineEntryBuilder extends Builder {
  public static key(trustLine: ITrustLine) {
    return makeKey(
      "trust_line_entry",
      trustLine.asset.code,
      trustLine.asset.issuer || "",
      trustLine.accountID,
      trustLine.lastModified
    );
  }

  public readonly current: IBlank;

  constructor(private trustLine: ITrustLine, prevKey?: string | null) {
    super();
    this.current = NQuad.blank(TrustLineEntryBuilder.key(trustLine));

    if (prevKey) {
      this.prev = NQuad.blank(prevKey);
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
      order: this.trustLine.lastModified
    });
    this.pushLedger(this.trustLine.lastModified);
    this.pushPrev();
    return this.nquads;
  }
}
