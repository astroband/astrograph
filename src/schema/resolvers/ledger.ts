import db from "../../database";
import { Ledger, LedgerHeader } from "../../model";
import { pubsub } from "../../pubsub";
import { createBatchResolver } from "./util";

const LEDGER_CREATED = "LEDGER_CREATED";

const ledgerHeaderResolver = createBatchResolver<Ledger, LedgerHeader>((source: any) =>
  db.ledgerHeaders.findAllBySeq(source.map((r: Ledger) => r.seq))
);

export default {
  Ledger: {
    header: ledgerHeaderResolver
  },
  Query: {
    ledger(root: any, args: any, ctx: any, info: any) {
      return db.ledgerHeaders.findBySeq(args.seq);
    },
    ledgers(root: any, args: any, ctx: any, info: any) {
      return db.ledgerHeaders.findAllBySeq(args.seq);
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
