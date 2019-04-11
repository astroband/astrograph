import { Asset } from "stellar-sdk";
import { AccountID } from "./account_id";

export interface IOfferBase {
  id: string;
  seller: AccountID;
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
  public seller: AccountID;
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
    this.seller = data.seller;
    this.selling = data.selling;
    this.buying = data.buying;
    this.amount = data.amount;
    this.priceN = data.priceN;
    this.priceD = data.priceD;
    this.price = data.price;
    this.passive = data.passive;
    this.lastModified = data.lastModified;
  }

  get paging_token() {
    return this.id;
  }
}
