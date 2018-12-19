import { Asset } from "stellar-sdk";
import { TrustLineValuesFactory } from "../model2/factories/trust_line_values_factory";
import { TrustLineValues } from "../model2/trust_line_values";
import { publicKeyFromXDR } from "../util/xdr";
import { IMutationType, MutationType } from "./mutation_type";

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
      this.values = TrustLineValuesFactory.fromXDR(xdr);
    }
  }
}
