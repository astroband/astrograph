import { Account, Offer } from "../../model";

import { assetResolver, createBatchResolver } from "./util";

import { db } from "../../database";

const accountResolver = createBatchResolver<Offer, Account>((source: any) =>
  db.accounts.findAllByIDs(source.map((r: Offer) => r.sellerid))
);

export default {
  Offer: {
    seller: accountResolver,
    selling: assetResolver,
    buying: assetResolver
  },
  Query: {
    offers(root: any, args: any, ctx: any, info: any) {
      return db.offers.findAll(args.seller, args.selling, args.buying, args.first, args.limit);
    }
  }
};
