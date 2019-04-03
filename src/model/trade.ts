import { Asset } from "stellar-sdk";

export interface ITrade {
  ledgerCloseTime: string;
  offerID: string;
  baseOfferID: string;
  baseAccountID: string;
  baseAmount: string;
  baseAsset: Asset;
  counterOfferID: string;
  counterAccountID: string;
  counterAsset: Asset;

}

export class Trade implements ITrade {
  public ledgerCloseTime: string;
  public offerID: string;
  public baseOfferID: string;
  public baseAccountID: string;
  public baseAmount: string;
  public baseAsset: Asset;
  public counterOfferID: string;
  public counterAccountID: string;
  public counterAsset: Asset;

  constructor(data: ITrade) {
    this.ledgerCloseTime = data.ledgerCloseTime;
    this.offerID = data.offerID;
    this.baseOfferID = data.baseOfferID;
    this.baseAccountID = data.baseAccountID;
    this.baseAmount = data.baseAmount;
    this.baseAsset = data.baseAsset;
    this.counterOfferID = data.baseOfferID;
    this.counterAccountID = data.counterAccountID;
    this.counterAsset = data.counterAsset;
  }
}
