import Asset from "../util/asset";
import { publicKeyFromBuffer } from "../util/xdr";
import { IMutationType, MutationType } from "./mutation_type";
import { OfferValues } from "./offer_values";

export class OfferSubscriptionPayload implements IMutationType {
  public mutationType: MutationType;
  public values: OfferValues | null = null;
  public accountID: string;
  public offerId: string;
  public selling: Asset | null = null;
  public buying: Asset | null = null;

  constructor(mutationType: MutationType, xdr: any) {
    this.mutationType = mutationType;
    this.offerId = xdr.offerId();
    this.accountID = publicKeyFromBuffer(xdr.sellerId().value());

    if (mutationType !== MutationType.Remove) {
      this.selling = Asset.fromOperation(xdr.selling());
      this.buying = Asset.fromOperation(xdr.buying());
      this.values = OfferValues.buildFromXDR(xdr);
    }
  }
}
