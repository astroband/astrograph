import { Asset } from "stellar-sdk";
import { AccountID } from "../model/account_id";
import { IOfferBase } from "./offer";

export type IOfferValues = IOfferBase;

export class OfferValues implements IOfferBase {
  public id: string;
  public seller: AccountID;
  public selling: Asset;
  public buying: Asset;
  public amount: string;
  public price: string;
  public priceN: number;
  public priceD: number;
  public passive: boolean;

  constructor(data: IOfferValues) {
    this.id = data.id;
    this.seller = data.seller;
    this.selling = data.selling;
    this.buying = data.buying;
    this.amount = data.amount;
    this.priceN = data.priceN;
    this.priceD = data.priceD;
    this.price = data.price;
    this.passive = data.passive;
  }
}
