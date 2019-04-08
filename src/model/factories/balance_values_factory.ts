import stellar from "stellar-base";
import { Asset } from "stellar-sdk";
import { MAX_INT64 } from "../../util";
import { publicKeyFromXDR } from "../../util/xdr/account";
import { BalanceValues } from "../balance_values";

export class BalanceValuesFactory {
  public static fromXDR(xdr: any): BalanceValues {
    return new BalanceValues({
      asset: Asset.fromOperation(xdr.asset()),
      account: publicKeyFromXDR(xdr),
      balance: xdr.balance().toString(),
      limit: xdr.limit().toString(),
      authorized: (xdr.flags() & stellar.xdr.TrustLineFlags.authorizedFlag().value) > 0
    });
  }

  public static fakeNativeFromXDR(xdr: any): BalanceValues {
    return new BalanceValues({
      account: publicKeyFromXDR(xdr),
      asset: Asset.native(),
      limit: MAX_INT64,
      authorized: true,
      balance: xdr.balance().toString()
    });
  }
}
