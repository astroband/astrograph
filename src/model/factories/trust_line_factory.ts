import { Asset, xdr as XDR } from "stellar-base";
import { MAX_INT64 } from "../../util";
import { Account } from "../account";
import { ITrustLine, TrustLine } from "../trust_line";
import { AssetFactory } from "./";

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
      asset: AssetFactory.fromDb(row.assettype, row.assetcode, row.issuer),
      authorized: (row.flags & XDR.TrustLineFlags.authorizedFlag().value) > 0
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
