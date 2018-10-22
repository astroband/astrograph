import { Asset } from "stellar-sdk";

import { FakeNativeTrustLineValues } from "./fake_native_trust_line_values";
import { IMutationType, MutationType } from "./mutation_type";

import { publicKeyFromXDR } from "../util/xdr";

export class NativeTrustLineSubscriptionPayload implements IMutationType {
  public mutationType: MutationType = MutationType.Update;
  public accountID: string;
  public values: FakeNativeTrustLineValues | null = null;

  constructor(mutationType: MutationType, xdr: any) {
    this.mutationType = mutationType;

    this.accountID = publicKeyFromXDR(xdr);

    if (this.mutationType !== MutationType.Remove) {
      this.values = FakeNativeTrustLineValues.buildFromXDR(xdr);
    }
  }

  get asset(): Asset {
    return Asset.native();
  }
}
