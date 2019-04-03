import { Asset } from "stellar-sdk";

export interface ITrade {
  ledgerCloseTime: string;
  baseOfferID: number;
  baseAccountID: string;
  baseAmount: string;
  baseAsset: Asset;
  counterOfferID: number;
  counterAccountID: string;
  counterAsset: Asset;

}

export class Trade implements ITrade {
  public ledgerCloseTime: string;
  public baseOfferID: number;
  public baseAccountID: string;
  public baseAmount: string;
  public baseAsset: Asset;
  public counterOfferID: number;
  public counterAccountID: string;
  public counterAsset: Asset;

  constructor(data: ITrade) {
    this.ledgerCloseTime = data.ledgerCloseTime;
    this.baseOfferID = data.baseOfferID;
    this.baseAccountID = data.baseAccountID;
    this.baseAmount = data.baseAmount;
    this.baseAsset = data.baseAsset;
    this.counterOfferID = data.baseOfferID;
    this.counterAccountID = data.counterAccountID;
    this.counterAsset = data.counterAsset;
  }
}
