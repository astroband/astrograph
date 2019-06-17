import { BigNumber } from "bignumber.js";
import { getRepository } from "typeorm";
import { AssetID, OfferSubscriptionPayload } from "../model";
import { Offer } from "../orm/entities/offer";
import { OFFER, pubsub } from "../pubsub";
import { OffersGraph } from "./data_structure";
import { PathFinder } from "./path_finder";

const offersGraph = new OffersGraph();

export function buildOffersGraph(offers: Offer[]): void {
  offersGraph.build(offers);
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

export function findPaths(sourceAssets: AssetID[], destAsset: AssetID, destAmount: BigNumber) {
  const pathFinder = new PathFinder(offersGraph);
  return pathFinder.findPaths(sourceAssets, destAsset, destAmount);
}
