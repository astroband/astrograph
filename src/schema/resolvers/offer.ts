// import { Account, Offer } from "../../model";

// import { createBatchResolver } from "./util";

// import { db } from "../../database";

// const accountResolver = createBatchResolver<Offer, Account>((source: any) =>
//   db.accounts.findAllByIDs(source.map((r: Offer) => r.sellerid))
// );

export default {
  // Offer: {
  //   seller: accountResolver
  // },
  Query: {
    offers(root: any, args: any, ctx: any, info: any) {
      // return db.offers.findAll(args.seller, args.selling, args.buying, args.limit, args.offset);
      process.exit(-1);
      return [];
    }
  }
};
