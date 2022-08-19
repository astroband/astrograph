import { dataSource } from "../database";
import { AssetID } from "../model";
import { AssetTransformer } from "../util/orm";

import { Account, AccountData, Asset, LedgerHeader, Offer, TrustLine } from "./entities";

export { Account, AccountData, Asset, LedgerHeader, Offer, TrustLine };

export const AccountRepository = dataSource.getRepository(Account);
export const AssetRepository = dataSource.getRepository(Asset);
export const TrustLineRepository = dataSource.getRepository(TrustLine);

export const OfferRepository = dataSource.getRepository(Offer).extend({
  async findBestAsk(sellingAsset: AssetID, buyingAsset: AssetID) {
    const qb = this.createQueryBuilder("offers");
    sellingAsset = AssetTransformer.to(sellingAsset);
    buyingAsset = AssetTransformer.to(buyingAsset);

    const row = await qb
      .select("MIN(price)", "minPrice")
      .where("offers.selling = :sellingAsset", { sellingAsset })
      .andWhere("offers.buying = :buyingAsset", { buyingAsset })
      .getRawOne();

    return row.minPrice;
  }
});
