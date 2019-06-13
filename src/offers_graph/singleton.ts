import { BigNumber } from "bignumber.js";
import { getRepository } from "typeorm";
import { AssetID, OfferSubscriptionPayload } from "../model";
import { AssetsWithBalances } from "../orm/entities/account";
import { Offer } from "../orm/entities/offer";
import { OFFER, pubsub } from "../pubsub";
import { OffersGraph } from "./data_structure";

const offersGraph = new OffersGraph();

export function buildOffersGraph(offers: Offer[]): void {
  offersGraph.build(offers);
  console.log(offersGraph.edgesCount);
}

export function updateOffersGraph(selling: AssetID, buying: AssetID, offers: Offer[]): void {
  offersGraph.update(selling, buying, offers);
}

export function listenOffers() {
  pubsub.subscribe(OFFER, async (payload: OfferSubscriptionPayload) => {
    const selling = payload.selling.toString();
    const buying = payload.buying.toString();
    const offers = await getRepository(Offer).find({ where: { selling, buying } });

    updateOffersGraph(selling, buying, offers);
  });
}

export function findPaths(sourceAssetsWithBalances: AssetsWithBalances, destAsset: AssetID, destAmount: BigNumber) {
  return offersGraph.findPaths(sourceAssetsWithBalances, destAsset, destAmount);
}
