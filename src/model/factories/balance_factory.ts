import { xdr as XDR } from "stellar-base";
import { Balance, IBalance } from "../";
import { Account } from "../../orm/entities";
import { MAX_INT64 } from "../../util";
import { getReservedBalance } from "../../util/base_reserve";

export interface ITrustLineTableRow {
  accountid: string;
  assettype: number;
  issuer: string;
  assetcode: string;
  tlimit: string;
  balance: string;
  flags: number;
  lastmodified: number;
  buyingliabilities: string | null;
  sellingliabilities: string | null;
}

export class BalanceFactory {
  public static fromDb(row: ITrustLineTableRow): Balance {
    const balance = BigInt(row.balance);
    const limit = BigInt(row.tlimit);
    const sellingLiabilities = row.sellingliabilities ? BigInt(row.sellingliabilities) : 0n;
    const buyingLiabilities = row.buyingliabilities ? BigInt(row.buyingliabilities) : 0n;

    const data: IBalance = {
      account: row.accountid,
      balance,
      limit,
      lastModified: row.lastmodified,
      asset: `${row.assetcode}-${row.issuer}`,
      authorized: (row.flags & XDR.TrustLineFlags.authorizedFlag().value) > 0,
      spendableBalance: balance - sellingLiabilities,
      receivableBalance: limit - balance - buyingLiabilities
    };

    return new Balance(data);
  }

  public static nativeForAccount(account: Account): IBalance {
    const balance = BigInt(account.balance.toString(10));
    const limit = BigInt(MAX_INT64);
    const minBalance = getReservedBalance(account.numSubentries);
    const selling = account.sellingLiabilities ? BigInt(account.sellingLiabilities.toString(10)) : 0n;
    const buying = account.buyingLiabilities ? BigInt(account.buyingLiabilities.toString(10)) : 0n;

    return new Balance({
      account: account.id,
      asset: "native",
      balance,
      limit,
      authorized: true,
      lastModified: account.lastModified,
      spendableBalance: balance - minBalance - selling,
      receivableBalance: limit - balance - buying
    });
  }
}
