import { AccountID, AssetID, ITrade } from "../model";
import { TradeFactory } from "../model/factories";
import { BaseStorage } from "./base";

export class TradesStorage extends BaseStorage {
  public forAccount(account: AccountID) {
    this.searchParams.query.bool.must.push({
      bool: { should: [{ term: { seller_id: account } }, { term: { buyer_id: account } }] }
    });

    return this;
  }

  public forOffer(offerID: string) {
    this.addTerm({ sold_offer_id: offerID });
    return this;
  }

  public filter(criteria: { assetSold?: AssetID; assetBought?: AssetID }) {
    if (criteria.assetSold) {
      this.addTerm({ "asset_sold.key": criteria.assetSold });
    }

    if (criteria.assetBought) {
      this.addTerm({ "asset_bought.key": criteria.assetBought });
    }

    return this;
  }

  protected get elasticIndexName() {
    return "trades";
  }

  protected convertRawDoc(doc: any): ITrade {
    return TradeFactory.fromStorage(doc);
  }
}
