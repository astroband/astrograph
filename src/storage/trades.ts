import { AssetID } from "../model";
import { BaseStorage } from "./base";

export class TradesStorage extends BaseStorage {
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
}
