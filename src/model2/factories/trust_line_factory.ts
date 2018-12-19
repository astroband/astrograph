import stellar from "stellar-base";
import { Asset } from "stellar-sdk";
import { MAX_INT64 } from "../../util";
import AssetBuilder from "../../util/asset";
import { Account } from "../account";
import { ITrustLine, TrustLine } from "../trust_line";

export interface ITrustLineTableRow {
  accountid: string;
  assettype: number;
  issuer: string;
  assetcode: string;
  tlimit: string;
  balance: string;
  flags: number;
  lastmodified: number;
  buyingliabilities: string;
  sellingliabilities: string;
}

export class TrustLineFactory {
  public static fromDb(row: ITrustLineTableRow): TrustLine {
    const data: ITrustLine = {
      accountID: row.accountid,
      balance: row.balance,
      limit: row.tlimit,
      lastModified: row.lastmodified,
      asset: AssetBuilder.build(row.assettype, row.assetcode, row.issuer),
      authorized: (row.flags & stellar.xdr.TrustLineFlags.authorizedFlag().value) > 0
    };

    return new TrustLine(data);
  }

  public static nativeForAccount(account: Account): ITrustLine {
    return new TrustLine({
      accountID: account.id,
      asset: Asset.native(),
      balance: account.balance,
      limit: MAX_INT64,
      authorized: true,
      lastModified: account.lastModified
    });
  }
}
