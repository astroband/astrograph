import { Asset, xdr as XDR } from "stellar-base";
import { IOffer, IOfferBase, Offer } from "../offer";

import { calculateOfferPrice } from "../../util/offer";
import { toFloatAmountString } from "../../util/stellar";

export interface IOfferTableRow {
  offerid: string;
  sellerid: string;
  sellingasset: string;
  buyingasset: string;
  amount: string;
  pricen: number;
  priced: number;
  price: string;
  flags: number;
  lastmodified: string;
}

export class OfferFactory {
  public static fromDb(row: IOfferTableRow): Offer {
    const data: IOffer = {
      id: row.offerid,
      sellerID: row.sellerid,
      selling: Asset.fromOperation(XDR.Asset.fromXDR(row.sellingasset, "base64")),
      buying: Asset.fromOperation(XDR.Asset.fromXDR(row.buyingasset, "base64")),
      amount: toFloatAmountString(row.amount),
      priceN: row.pricen,
      priceD: row.priced,
      price: calculateOfferPrice(row.pricen, row.priced),
      passive: (row.flags && XDR.OfferEntryFlags.passiveFlag().value) > 0,
      lastModified: row.lastmodified
    };

    return new Offer(data);
  }

  // builds offer from LedgerStateEntry
  public static fromXDR(xdr: any): IOfferBase {
    const priceN = xdr.price().n();
    const priceD = xdr.price().d();

    return {
      id: xdr.offerId().toInt(),
      sellerID: xdr.sellerId().value(),
      selling: Asset.fromOperation(xdr.selling()),
      buying: Asset.fromOperation(xdr.buying()),
      amount: xdr.amount().toInt(),
      priceN,
      priceD,
      price: calculateOfferPrice(priceN, priceD),
      passive: (xdr.flags() && XDR.OfferEntryFlags.passiveFlag().value) > 0
    };
  }
}
