import { BigNumber } from "bignumber.js";
import { getRepository } from "typeorm";
import { AssetID, OfferSubscriptionPayload } from "../../model";
import { Offer } from "../../orm/entities";
import { OFFER, pubsub } from "../../pubsub";
import { Order, OrderBook } from "../orderbook";
import { findPaths as findPathsInGraph } from "./path_finder";

export type Arc = [AssetID, BigNumber, OrderBook];
export type Arcs = Arc[];
export type Graph = Map<AssetID, Arcs>;

let offersGraph: Graph;

export async function buildOffersGraph(offers: Offer[]) {
  offersGraph = setup(offers);
}

export function updateOffersGraph(selling: AssetID, buying: AssetID, offers: Offer[]) {
  update(offersGraph, selling, buying, offers);
}

export function listenOffers() {
  pubsub.subscribe(OFFER, async (payload: OfferSubscriptionPayload) => {
    const selling = payload.selling.toString();
    const buying = payload.buying.toString();
    const offers = await getRepository(Offer).find({ where: { selling, buying } });

    updateOffersGraph(selling, buying, offers);
  });
}

export function findPaths(targetAssets: AssetID[], destAsset: AssetID, destAmount: BigNumber) {
  return findPathsInGraph(offersGraph, targetAssets, destAsset, destAmount);
}

function setup(offers: Offer[]) {
  const graph: { [asset: string]: { [asset: string]: Offer[] } } = {};
  const nodes = new Map<string, Arcs>();

  for (const offer of offers) {
    const [assetToBuy, assetToSell] = [offer.buying, offer.selling];

    let sellNode = graph[assetToSell];

    if (!sellNode) {
      graph[assetToSell] = sellNode = {};
    }

    let arc = sellNode[assetToBuy];

    if (!arc) {
      sellNode[assetToBuy] = arc = [];
    }

    arc.push(offer);
  }

  for (const [assetToSell, node] of Object.entries(graph)) {
    const arcs: Arcs = [];
    for (const [assetToBuy, arc] of Object.entries<Offer[]>(node)) {
      const orderBook = arc
        .sort((a, b) => a.price.comparedTo(b.price))
        .map<Order>(offer => [offer.amount, offer.price]);

      const capacity = orderBook.reduce((acc: BigNumber, el: Order) => acc.plus(el[0]), orderBook[0][0]);

      arcs.push([assetToBuy, capacity, orderBook]);
    }

    nodes.set(assetToSell, arcs);
  }

  return nodes;
}

function update(graph: Graph, selling: AssetID, buying: AssetID, offers: Offer[]): void {
  if (offers.length) {
    let capacity = new BigNumber(0);
    const orderBook: OrderBook = [];

    for (const offer of offers) {
      orderBook.push([offer.amount, offer.price]);
      capacity = capacity.plus(offer.amount);
    }

    const arc: Arc = [buying, capacity, orderBook];

    const arcs = graph.get(selling);

    if (arcs) {
      const index = arcs.findIndex(([asset, ]) => asset === buying);

      if (index !== -1) {
        arcs.splice(index, 1, arc); //  arcs[index] = arc;
      } else {
        arcs.push(arc);
      }
    } else {
      graph.set(selling, [arc]);
    }
  } else {
    const arcs = graph.get(selling) as Arcs;
    const index = arcs.findIndex(([asset, ]) => asset === buying);
    arcs.splice(index, 1);
    if (arcs.length === 0) {
      graph.delete(selling);
    }
  }
}
