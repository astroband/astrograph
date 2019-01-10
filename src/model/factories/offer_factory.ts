import BigNumber from "bignumber.js";
import stellar from "stellar-base";
import { Asset } from "../asset";
import { IOffer, Offer } from "../offer";

import { toFloatAmountString } from "../../util/stellar";

export interface IOfferTableRow {
  offerid: string;
  sellerid: string;
  sellingassettype: number;
  sellingassetcode: string;
  sellingissuer: string;
  buyingassettype: number;
  buyingassetcode: string;
  buyingissuer: string;
  amount: string;
  pricen: number;
  priced: number;
  price: string;
  flags: number;
  lastmodified: string;
}

export class OfferFactory {
  public static fromDb(row: IOfferTableRow): Offer | null | IOffer | Asset {
    const data: IOffer = {
      id: row.offerid,
      sellerID: row.sellerid,
      selling: Asset.fromDb(row.sellingassettype, row.sellingassetcode, row.sellingissuer),
      buying: Asset.fromDb(row.buyingassettype, row.buyingassetcode, row.buyingissuer),
      amount: toFloatAmountString(row.amount),
      priceN: row.pricen,
      priceD: row.priced,
      price: new BigNumber(row.pricen).div(row.priced).toString(),
      passive: (row.flags && stellar.xdr.OfferEntryFlags.passiveFlag().value) > 0,
      lastModified: row.lastmodified
    };

    return new Offer(data);
  }
}
