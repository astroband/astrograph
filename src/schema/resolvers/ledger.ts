import { db } from "../../database";
import { Ledger, LedgerHeader } from "../../model";
import { pubsub } from "../../pubsub";
import { createBatchResolver, transactionsResolver } from "./util";

const LEDGER_CREATED = "LEDGER_CREATED";

const ledgerHeaderResolver = createBatchResolver<Ledger, LedgerHeader>((source: any) =>
  db.ledgerHeaders.findAllBySeq(source.map((r: Ledger) => r.seq))
);

export default {
  Ledger: {
    header: ledgerHeaderResolver,
    transactions: transactionsResolver
  },
  Query: {
    ledger(root: any, args: any, ctx: any, info: any) {
      return new Ledger(args.seq);
    },
    ledgers(root: any, args: any, ctx: any, info: any) {
      return args.seq.map((seq: number) => new Ledger(seq));
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
