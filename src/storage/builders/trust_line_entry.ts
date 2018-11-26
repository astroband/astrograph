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

  constructor(private trustLine: ITrustLine, prevKey?: string) {
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
    this.pushValue("balance", this.trustLine.balance);
    this.pushValue("ledger_seq", this.trustLine.lastModified);
    this.pushValue("type", "trust_line_entry");
    this.pushPrev();
    return this.nquads;
  }
}
