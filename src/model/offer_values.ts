import Asset from "../util/asset";
import { Offer } from "./offer";

import { publicKeyFromBuffer } from "../util/xdr";

export class OfferValues extends Offer {
  public static buildFromXDR(xdr: any): OfferValues {
    const sellerid = publicKeyFromBuffer(xdr.sellerId().value());

    return new OfferValues({
      offerid: xdr.offerId(),
      sellerid,
      selling: Asset.fromOperation(xdr.selling()),
      buying: Asset.fromOperation(xdr.buying()),
      amount: xdr.amount(),
      price: xdr.price().toString(),
      pricen: xdr.price().n(),
      priced: xdr.price().d(),
      flags: xdr.flags()
    });
  }
}
