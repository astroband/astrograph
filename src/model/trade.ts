import stellar from "stellar-base";

export interface ITrade {
  id: string;
  ledgerCloseTime: string;
  offer: string;
  baseOffer: string;
  baseAccount: string;
  baseAmount: string;
  baseAsset: stellar.Asset;
  counterOffer: string;
  counterAccount: string;
  counterAsset: stellar.Asset;
  baseIsSeller: boolean;
  price: string;
}

export class Trade implements ITrade {
  public id: string;
  public ledgerCloseTime: string;
  public offer: string;
  public baseOffer: string;
  public baseAccount: string;
  public baseAmount: string;
  public baseAsset: stellar.Asset;
  public counterOffer: string;
  public counterAccount: string;
  public counterAsset: stellar.Asset;
  public baseIsSeller: boolean;
  public price: string;

  constructor(data: ITrade) {
    this.id = data.id;
    this.ledgerCloseTime = data.ledgerCloseTime;
    this.offer = data.offer;
    this.baseOffer = data.baseOffer;
    this.baseAccount = data.baseAccount;
    this.baseAmount = data.baseAmount;
    this.baseAsset = data.baseAsset;
    this.counterOffer = data.counterOffer;
    this.counterAccount = data.counterAccount;
    this.counterAsset = data.counterAsset;
    this.baseIsSeller = data.baseIsSeller;
    this.price = data.price;
  }
}
