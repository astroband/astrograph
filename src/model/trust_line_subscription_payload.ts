import { Asset } from "stellar-sdk";
import { IMutationType, MutationType } from "./mutation_type";
import { TrustLineValues } from "./trust_line_values";

import { publicKeyFromXDR } from "../util/xdr";

export class TrustLineSubscriptionPayload implements IMutationType {
  public accountID: string;
  public asset: Asset;
  public mutationType: MutationType;
  public values: TrustLineValues | null = null;

  constructor(mutationType: MutationType, xdr: any) {
    this.mutationType = mutationType;

    this.accountID = publicKeyFromXDR(xdr);
    this.asset = Asset.fromOperation(xdr.asset());

    if (this.mutationType !== MutationType.Remove) {
      this.values = TrustLineValues.buildFromXDR(xdr);
    }
  }
}
