import { BigNumber } from "bignumber.js";
import { AssetID } from "../../model";
import { Offer, OfferRepository } from "../../orm";

import { OffersGraph } from "./offers_graph";
import { load as loadOrderBook } from "./orderbook";
import { PathFinder } from "./path_finder";

const offersGraph = new OffersGraph();

export * from "./offers_listener";

export async function initOffersGraph() {
  const qb = OfferRepository.createQueryBuilder("offers")
    .addOrderBy("offerid", "DESC")
    .limit(100000);
  const offers = await qb.getMany();

  buildOffersGraph(offers);
}

export function buildOffersGraph(offers: Offer[]): void {
  offersGraph.build(offers);
}

export function updateOffersGraph(selling: AssetID, buying: AssetID, offers: Offer[]): void {
  offersGraph.update(selling, buying, offers);
}

export function findPaymentPaths(sourceAssets: AssetID[], destAsset: AssetID, destAmount: BigNumber) {
  const pathFinder = new PathFinder(offersGraph);
  return pathFinder.findPaths(sourceAssets, destAsset, destAmount);
}

export const orderBook = { load: loadOrderBook };
