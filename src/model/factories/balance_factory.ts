import BigNumber from "bignumber.js";
import { Asset, xdr as XDR } from "stellar-base";
import { Account, Balance, IBalance } from "../";
import { MAX_INT64 } from "../../util";
import { getReservedBalance } from "../../util/stellar";
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

export class BalanceFactory {
  public static fromDb(row: ITrustLineTableRow): Balance {
    const balance = new BigNumber(row.balance);
    const limit = new BigNumber(row.tlimit);

    const data: IBalance = {
      account: row.accountid,
      balance,
      limit,
      lastModified: row.lastmodified,
      asset: AssetFactory.fromDb(row.assettype, row.assetcode, row.issuer),
      authorized: (row.flags & XDR.TrustLineFlags.authorizedFlag().value) > 0,
      spendableBalance: balance.minus(row.sellingliabilities || 0),
      receivableBalance: limit.minus(row.buyingliabilities || 0).minus(balance)
    };

    return new Balance(data);
  }

  public static async nativeForAccount(account: Account): Promise<IBalance> {
    const balance = new BigNumber(account.balance);
    const limit = new BigNumber(MAX_INT64);
    const minBalance = await getReservedBalance(account.numSubentries);

    return new Balance({
      account: account.id,
      asset: Asset.native(),
      balance,
      limit,
      authorized: true,
      lastModified: account.lastModified,
      spendableBalance: balance.minus(account.sellingLiabilities).minus(minBalance),
      receivableBalance: limit.minus(account.buyingLiabilities).minus(balance)
    });
  }
}
