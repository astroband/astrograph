import { BigNumber } from "bignumber.js";
import stellar from "stellar-base";
import { MAX_INT64 } from "../../util";
import { publicKeyFromXDR } from "../../util/xdr/account";
import { BalanceValues } from "../balance_values";

export class BalanceValuesFactory {
  public static fromXDR(xdr: any): BalanceValues {
    return new BalanceValues({
      asset: stellar.Asset.fromOperation(xdr.asset()).toString(),
      account: publicKeyFromXDR(xdr),
      balance: new BigNumber(xdr.balance().toString()),
      limit: new BigNumber(xdr.limit().toString()),
      authorized: (xdr.flags() & stellar.xdr.TrustLineFlags.authorizedFlag().value) > 0
    });
  }

  public static fakeNativeFromXDR(xdr: any): BalanceValues {
    return new BalanceValues({
      account: publicKeyFromXDR(xdr),
      asset: "native",
      limit: new BigNumber(MAX_INT64),
      authorized: true,
      balance: new BigNumber(xdr.balance().toString())
    });
  }
}
