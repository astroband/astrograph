import BigNumber from "bignumber.js";
import stellar from "stellar-base";
import Asset from "../util/asset";
import { toFloatAmountString } from "../util/stellar";

export class Offer {
  public id: string;
  public sellerid: string;
  public selling: Asset;
  public buying: Asset;
  public amount: string;
  public price: string;
  public pricen: number;
  public priced: number;
  public passive: boolean;

  constructor(data: {
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
  }) {
    this.id = data.offerid;
    this.sellerid = data.sellerid;
    this.selling = Asset.build(data.sellingassettype, data.sellingassetcode, data.sellingissuer);
    this.buying = Asset.build(data.buyingassettype, data.buyingassetcode, data.buyingissuer);
    this.amount = toFloatAmountString(data.amount);
    this.pricen = data.pricen;
    this.priced = data.priced;
    this.price = new BigNumber(data.pricen).div(data.priced).toString();
    this.passive = (data.flags && stellar.xdr.OfferEntryFlags.passiveFlag().value) > 0;
  }
}
