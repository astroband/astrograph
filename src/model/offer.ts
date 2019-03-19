import { Asset } from "stellar-sdk";

export interface IOfferBase {
  id: string;
  sellerID: string;
  selling: Asset;
  buying: Asset;
  amount: string;
  price: string;
  priceN: number;
  priceD: number;
  passive: boolean;
}

export interface IOffer extends IOfferBase {
  lastModified: string;
}

export class Offer implements IOffer {
  public id: string;
  public sellerID: string;
  public selling: Asset;
  public buying: Asset;
  public amount: string;
  public price: string;
  public priceN: number;
  public priceD: number;
  public passive: boolean;
  public lastModified: string;

  constructor(data: IOffer) {
    this.id = data.id;
    this.sellerID = data.sellerID;
    this.selling = data.selling;
    this.buying = data.buying;
    this.amount = data.amount;
    this.priceN = data.priceN;
    this.priceD = data.priceD;
    this.price = data.price;
    this.passive = data.passive;
    this.lastModified = data.lastModified;
  }
}
