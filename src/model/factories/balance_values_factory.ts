import { Asset, xdr } from "stellar-base";
import { MAX_INT64 } from "../../util";
import { publicKeyFromXDR } from "../../util/xdr/account";
import { BalanceValues } from "../balance_values";

export class BalanceValuesFactory {
  public static fromXDR(input: any): BalanceValues {
    return new BalanceValues({
      asset: Asset.fromOperation(input.asset()).toString(),
      account: publicKeyFromXDR(input),
      authorized: (input.flags() & xdr.TrustLineFlags.authorizedFlag().value) > 0,
      limit: BigInt(input.limit().toString()),
      balance: BigInt(input.balance().toString())
    });
  }

  public static fakeNativeFromXDR(input: any): BalanceValues {
    return new BalanceValues({
      account: publicKeyFromXDR(input),
      asset: "native",
      authorized: true,
      limit: BigInt(MAX_INT64),
      balance: BigInt(input.balance().toString())
    });
  }
}
