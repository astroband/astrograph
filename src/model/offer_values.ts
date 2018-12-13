import Asset from "../util/asset";
import { Offer } from "./offer";

import { publicKeyFromBuffer } from "../util/xdr";

export class OfferValues extends Offer {
  public static buildFromXDR(xdr: any): OfferValues {
    const sellerid = publicKeyFromBuffer(xdr.sellerId().value());
    const selling = Asset.fromOperation(xdr.selling()); // DOH! Failed to overload constructor, need to
    const buying = Asset.fromOperation(xdr.buying()); // investigate more.

    return new OfferValues({
      offerid: xdr.offerId(),
      sellerid,
      sellingassettype: selling.getAssetType() === "native" ? 0 : 1,
      sellingassetcode: selling.getCode(),
      sellingissuer: selling.getIssuer(),
      buyingassettype: buying.getAssetType() === "native" ? 0 : 1,
      buyingassetcode: buying.getCode(),
      buyingissuer: buying.getIssuer(),
      amount: xdr.amount(),
      price: xdr.price().toString(),
      pricen: xdr.price().n(),
      priced: xdr.price().d(),
      flags: xdr.flags(),
      lastmodified: -1
    });
  }
}
