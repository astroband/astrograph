import { Asset, xdr as XDR } from "stellar-base";

import { IOfferValues, OfferValues } from "../offer_values";

import { calculateOfferPrice } from "../../util/offer";
import { toFloatAmountString } from "../../util/stellar";
import { publicKeyFromBuffer } from "../../util/xdr";

export class OfferValuesFactory {
  public static fromXDR(xdr: any): OfferValues {
    const seller = publicKeyFromBuffer(xdr.sellerId().value());
    const selling = Asset.fromOperation(xdr.selling());
    const buying = Asset.fromOperation(xdr.buying());

    const data: IOfferValues = {
      id: xdr.offerId().toInt(),
      seller,
      selling,
      buying,
      amount: toFloatAmountString(xdr.amount()),
      priceN: xdr.price().n(),
      priceD: xdr.price().d(),
      price: calculateOfferPrice(xdr.price().n(), xdr.price().d()),
      passive: (xdr.flags().value && XDR.OfferEntryFlags.passiveFlag().value) > 0
    };

    return new OfferValues(data);
  }
}
