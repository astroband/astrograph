import { publicKeyFromBuffer } from "../util/xdr";
import { IMutationType, MutationType } from "./mutation_type";
import { OfferValues } from "./offer_values";

export class OfferSubscriptionPayload implements IMutationType {
  public mutationType: MutationType;
  public values: OfferValues | null = null;
  public accountID: string;
  public offerID: string;

  constructor(mutationType: MutationType, xdr: any) {
    this.mutationType = mutationType;
    this.accountID = publicKeyFromBuffer(xdr.sellerId().value());
    this.offerID = xdr.offerId();

    if (mutationType !== MutationType.Remove) {
      this.values = OfferValues.buildFromXDR(xdr);
    }
  }
}
