import stellar from "stellar-base";

import { OfferValuesFactory } from "./factories/offer_values_factory";
import { IMutationType, MutationType } from "./mutation_type";
import { OfferValues } from "./offer_values";

import { IChange } from "../changes_extractor";
import { publicKeyFromBuffer } from "../util/xdr";

export class OfferSubscriptionPayload implements IMutationType {
  public mutationType: MutationType;
  public values: OfferValues | null = null;
  public accountID: string;
  public offerID: string;
  public selling: stellar.Asset;
  public buying: stellar.Asset;

  constructor(mutationType: MutationType, change: IChange) {
    const xdr = change.data.offer();

    this.mutationType = mutationType;
    this.offerID = xdr.offerId().toInt();
    this.accountID = publicKeyFromBuffer(xdr.sellerId().value());

    if (mutationType !== MutationType.Remove) {
      this.selling = stellar.Asset.fromOperation(xdr.selling());
      this.buying = stellar.Asset.fromOperation(xdr.buying());
      this.values = OfferValuesFactory.fromXDR(xdr);
    } else {
      this.selling = change.prevState.selling;
      this.buying = change.prevState.buying;
    }
  }
}
