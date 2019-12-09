import { AccountID, AssetID } from "./";

export interface ITrade {
  id: string;
  ledgerCloseTime: string;
  offer: string;
  seller: AccountID;
  buyer: AccountID;
  assetSold: AssetID;
  assetBought: AssetID;
  amountSold: string;
  amountBought: string;
  price: string;
}
