import { EntityRepository, Repository } from "typeorm";
import { AssetID } from "../../model";
import { AssetTransformer } from "../../util/orm";
import { Offer } from "../entities/offer";

@EntityRepository(Offer)
export class OfferRepository extends Repository<Offer> {
  public async findBestAsk(sellingAsset: AssetID, buyingAsset: AssetID) {
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
}
