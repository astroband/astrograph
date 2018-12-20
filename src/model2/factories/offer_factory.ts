import BigNumber from "bignumber.js";
import stellar from "stellar-base";
import Asset from "../../util/asset";
import { toFloatAmountString } from "../../util/stellar";
import { IOffer, Offer } from "../offer";

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
}

export class OfferFactory {
  public static fromDb(row: IOfferTableRow): Offer {
    const data: IOffer = {
      id: row.offerid,
      sellerID: row.sellerid,
      selling: Asset.build(row.sellingassettype, row.sellingassetcode, row.sellingissuer),
      buying: Asset.build(row.buyingassettype, row.buyingassetcode, row.buyingissuer),
      amount: toFloatAmountString(row.amount),
      priceN: row.pricen,
      priceD: row.priced,
      price: new BigNumber(row.pricen).div(row.priced).toString(),
      passive: (row.flags && stellar.xdr.OfferEntryFlags.passiveFlag().value) > 0
    };

    return new Offer(data);
  }
}
