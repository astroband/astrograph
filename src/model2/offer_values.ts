import Asset from "../util/asset";
import { IOfferBase } from "./offer";

export type IOfferValues = IOfferBase;

export class OfferValues implements IOfferBase {
  public id: string;
  public sellerID: string;
  public selling: Asset;
  public buying: Asset;
  public amount: string;
  public price: string;
  public priceN: number;
  public priceD: number;
  public passive: boolean;

  constructor(data: IOfferValues) {
    this.id = data.id;
    this.sellerID = data.sellerID;
    this.selling = data.selling;
    this.buying = data.buying;
    this.amount = data.amount;
    this.priceN = data.priceN;
    this.priceD = data.priceD;
    this.price = data.price;
    this.passive = data.passive;
  }
}
