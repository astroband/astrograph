import { Asset } from "stellar-sdk";
import { AccountID, TrustLineValues } from "../model";
import { TrustLineValuesFactory } from "../model/factories";
import { publicKeyFromXDR } from "../util/xdr";
import { IMutationType, MutationType } from "./mutation_type";

export class TrustLineSubscriptionPayload implements IMutationType {
  public account: AccountID;
  public asset: Asset;
  public mutationType: MutationType;
  public values: TrustLineValues | null = null;

  constructor(mutationType: MutationType, xdr: any) {
    this.mutationType = mutationType;

    this.account = publicKeyFromXDR(xdr);
    this.asset = Asset.fromOperation(xdr.asset());

    if (this.mutationType !== MutationType.Remove) {
      this.values = TrustLineValuesFactory.fromXDR(xdr);
    }
  }
}
