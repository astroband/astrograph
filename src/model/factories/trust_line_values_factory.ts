import stellar from "stellar-base";
import { Asset } from "stellar-sdk";
import { MAX_INT64 } from "../../util";
import { publicKeyFromXDR } from "../../util/xdr/account";
import { TrustLineValues } from "../trust_line_values";

export class TrustLineValuesFactory {
  public static fromXDR(xdr: any): TrustLineValues {
    return new TrustLineValues({
      asset: Asset.fromOperation(xdr.asset()),
      account: publicKeyFromXDR(xdr),
      balance: xdr.balance().toString(),
      limit: xdr.limit().toString(),
      authorized: (xdr.flags() & stellar.xdr.TrustLineFlags.authorizedFlag().value) > 0
    });
  }

  public static fakeNativeFromXDR(xdr: any): TrustLineValues {
    return new TrustLineValues({
      account: publicKeyFromXDR(xdr),
      asset: Asset.native(),
      limit: MAX_INT64,
      authorized: true,
      balance: xdr.balance().toString()
    });
  }
}
