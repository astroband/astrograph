// import { publicKeyFromXDR } from "../util/xdr";
import { IMutationType, MutationType } from "./mutation_type";
import { OfferValues } from "./offer_values";

export class OfferSubscriptionPayload implements IMutationType {
  public mutationType: MutationType;
  public values: OfferValues | null = null;

  constructor(mutationType: MutationType, xdr: any) {
    this.mutationType = mutationType;
    // this.accountID = publicKeyFromXDR(xdr);
    // this.name = xdr.dataName().toString();

    if (mutationType !== MutationType.Remove) {
      this.values = OfferValues.buildFromXDR(xdr);
    }
  }
}
