import BigNumber from "bignumber.js";
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
    const balance = new BigNumber(row.balance);
    const limit = new BigNumber(row.tlimit);

    const data: IBalance = {
      account: row.accountid,
      balance,
      limit,
      lastModified: row.lastmodified,
      asset: `${row.assetcode}-${row.issuer}`,
      authorized: (row.flags & XDR.TrustLineFlags.authorizedFlag().value) > 0,
      spendableBalance: balance.minus(row.sellingliabilities || 0),
      receivableBalance: limit.minus(row.buyingliabilities || 0).minus(balance)
    };

    return new Balance(data);
  }

  public static nativeForAccount(account: Account): IBalance {
    const balance = new BigNumber(account.balance);
    const limit = new BigNumber(MAX_INT64);
    const minBalance = getReservedBalance(account.numSubentries);

    return new Balance({
      account: account.id,
      asset: "native",
      balance,
      limit,
      authorized: true,
      lastModified: account.lastModified,
      spendableBalance: balance.minus(account.sellingLiabilities || 0).minus(minBalance),
      receivableBalance: limit.minus(account.buyingLiabilities || 0).minus(balance)
    });
  }
}
