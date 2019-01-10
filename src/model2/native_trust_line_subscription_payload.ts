import { TrustLineValuesFactory } from "./factories/trust_line_values_factory";

import { Asset } from "./asset";
import { IMutationType, MutationType } from "./mutation_type";
import { TrustLineValues } from "./trust_line_values";

import { publicKeyFromXDR } from "../util/xdr";

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
