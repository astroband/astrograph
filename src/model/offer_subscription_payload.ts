import { Asset } from "stellar-sdk";

import { OfferValuesFactory } from "./factories/offer_values_factory";
import { IMutationType, MutationType } from "./mutation_type";
import { OfferValues } from "./offer_values";

import { IChange } from "../changes_extractor";
import { publicKeyFromBuffer } from "../util/xdr";

export class OfferSubscriptionPayload implements IMutationType {
  public mutationType: MutationType;
  public values: OfferValues | null = null;
  public accountID: string;
  public offerId: string;
  public selling: Asset;
  public buying: Asset;

  constructor(mutationType: MutationType, change: IChange) {
    const xdr = change.data.offer();

    this.mutationType = mutationType;
    this.offerId = xdr.offerId().toString();
    this.accountID = publicKeyFromBuffer(xdr.sellerId().value());

    if (mutationType !== MutationType.Remove) {
      this.selling = Asset.fromOperation(xdr.selling());
      this.buying = Asset.fromOperation(xdr.buying());
      this.values = OfferValuesFactory.fromXDR(xdr);
    } else {
      this.selling = change.prevState.selling;
      this.buying = change.prevState.buying;
    }
  }
}
