import { EntityRepository, Repository } from "typeorm";
import { AssetID } from "../../model";
import { AssetTransformer } from "../../util/orm";
import { Offer } from "../entities/offer";

@EntityRepository(Offer)
export class OfferRepository extends Repository<Offer> {
  public async findBestAsk(selling: AssetID, buying: AssetID) {
    const qb = this.createQueryBuilder("offers");
    selling = AssetTransformer.to(selling);
    buying = AssetTransformer.to(buying);

    const row = await qb
      .select("MIN(price)", "minPrice")
      .where("offers.selling = :selling", { selling })
      .andWhere("offers.buying = :buying", { buying })
      .getRawOne();

    return row.minPrice;
  }
}
