import { Asset, xdr as XDR } from "stellar-base";

import { IOfferValues, OfferValues } from "../offer_values";

import { publicKeyFromBuffer } from "../../util/xdr";

export class OfferValuesFactory {
  public static fromXDR(xdr: any): OfferValues {
    const sellerID = publicKeyFromBuffer(xdr.sellerId().value());
    const selling = Asset.fromOperation(xdr.selling());
    const buying = Asset.fromOperation(xdr.buying());

    const data: IOfferValues = {
      id: xdr.offerId(),
      sellerID,
      selling,
      buying,
      amount: xdr.amount(),
      price: xdr.price().toString(),
      priceN: xdr.price().n(),
      priceD: xdr.price().d(),
      passive: (xdr.flags().value && XDR.OfferEntryFlags.passiveFlag().value) > 0
    };

    return new OfferValues(data);
  }
}
