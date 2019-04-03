import { Asset } from "stellar-sdk";

export interface ITrade {
  ledgerCloseTime: string;
  offer: string;
  baseOffer: string;
  baseAccount: string;
  baseAmount: string;
  baseAsset: Asset;
  counterOffer: string;
  counterAccount: string;
  counterAsset: Asset;

}

export class Trade implements ITrade {
  public ledgerCloseTime: string;
  public offer: string;
  public baseOffer: string;
  public baseAccount: string;
  public baseAmount: string;
  public baseAsset: Asset;
  public counterOffer: string;
  public counterAccount: string;
  public counterAsset: Asset;

  constructor(data: ITrade) {
    this.ledgerCloseTime = data.ledgerCloseTime;
    this.offer = data.offer;
    this.baseOffer = data.baseOffer;
    this.baseAccount = data.baseAccount;
    this.baseAmount = data.baseAmount;
    this.baseAsset = data.baseAsset;
    this.counterOffer = data.baseOffer;
    this.counterAccount = data.counterAccount;
    this.counterAsset = data.counterAsset;
  }
}
