import db from "../../database";
import { pubsub } from "../../pubsub";

const LEDGER_CREATED = "LEDGER_CREATED";

export default {
  Query: {
    ledger(root: any, args: any, ctx: any, info: any) {
      return db.ledgers.findBySeq(args.seq);
    },
    ledgers(root: any, args: any, ctx: any, info: any) {
      return db.ledgers.findAllBySeq(args.seq);
    }
  },
  Subscription: {
    ledgerCreated: {
      resolve(payload: any, args: any, ctx: any, info: any) {
        return payload;
      },
      subscribe() {
        return pubsub.asyncIterator([LEDGER_CREATED]);
      }
    }
  }
};
