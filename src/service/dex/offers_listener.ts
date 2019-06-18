import { getRepository } from "typeorm";
import { AssetID, OfferSubscriptionPayload } from "../../model";
import { Offer } from "../../orm/entities/offer";
import { LEDGER_CREATED, OFFER, pubsub } from "../../pubsub";
import { updateOffersGraph } from "./";

// what asset pairs were affected by offers in the last ledger
const modifiedAssetPairs = new Set<string>();

export function listenOffers() {
  pubsub.subscribe(OFFER, (payload: OfferSubscriptionPayload) => {
    const selling = payload.selling.toString();
    const buying = payload.buying.toString();
    modifiedAssetPairs.add(JSON.stringify({ selling, buying }));
  });

  pubsub.subscribe(LEDGER_CREATED, async () => {
    if (modifiedAssetPairs.size === 0) {
      return;
    }

    const assetPairs: Array<{ selling: AssetID; buying: AssetID }> = Array.from(modifiedAssetPairs).map(pair =>
      JSON.parse(pair)
    );

    modifiedAssetPairs.clear();

    for (const pair of assetPairs) {
      const offers = await getRepository(Offer).find({ where: pair });
      updateOffersGraph(pair.selling, pair.buying, offers);
    }
  });
}
