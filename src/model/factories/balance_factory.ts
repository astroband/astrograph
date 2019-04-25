import { xdr as XDR } from "stellar-base";
import { MAX_INT64 } from "../../util";
import { Account } from "../account";
import { Balance, IBalance } from "../balance";

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

export class BalanceFactory {
  public static fromDb(row: ITrustLineTableRow): Balance {
    const data: IBalance = {
      account: row.accountid,
      balance: row.balance,
      limit: row.tlimit,
      lastModified: row.lastmodified,
      asset: `${row.assetcode}-${row.issuer}`,
      authorized: (row.flags & XDR.TrustLineFlags.authorizedFlag().value) > 0
    };

    return new Balance(data);
  }

  public static nativeForAccount(account: Account): IBalance {
    return new Balance({
      account: account.id,
      asset: "native",
      balance: account.balance,
      limit: MAX_INT64,
      authorized: true,
      lastModified: account.lastModified
    });
  }
}
