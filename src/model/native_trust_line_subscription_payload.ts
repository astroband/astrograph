import { Asset } from "stellar-sdk";
import { TrustLineValuesFactory } from "../model2/factories/trust_line_values_factory";
import { TrustLineValues } from "../model2/trust_line_values";
import { publicKeyFromXDR } from "../util/xdr";
import { IMutationType, MutationType } from "./mutation_type";

export class NativeTrustLineSubscriptionPayload implements IMutationType {
  public mutationType: MutationType = MutationType.Update;
  public accountID: string;
  public values: TrustLineValues | null = null;

  constructor(mutationType: MutationType, xdr: any) {
    this.mutationType = mutationType;

    this.accountID = publicKeyFromXDR(xdr);

    if (this.mutationType !== MutationType.Remove) {
      this.values = TrustLineValuesFactory.fakeNativeFromXDR(xdr);
    }
  }

  get asset(): Asset {
    return Asset.native();
  }
}
