import BigNumber from "bignumber.js";
import { Balance, IBalance } from "../";
import { Account } from "../../orm/entities";
import { MAX_INT64 } from "../../util";
import { getReservedBalance } from "../../util/base_reserve";

export class BalanceFactory {
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
