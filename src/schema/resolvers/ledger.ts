import { db } from "../../database";
import { IHorizonEffectData, IHorizonOperationData, IHorizonTransactionData } from "../../datasource/types";
import { IApolloContext } from "../../graphql_server";
import { Effect, Ledger, LedgerHeader, Operation, Transaction } from "../../model";
import { EffectFactory, OperationFactory, TransactionWithXDRFactory } from "../../model/factories";
import { LEDGER_CREATED, pubsub } from "../../pubsub";
import { createBatchResolver, makeConnection } from "./util";

const ledgerHeaderResolver = createBatchResolver<Ledger, LedgerHeader>(async (ledgers: Ledger[]) => {
  const seqNumsWithoutHeaders = ledgers.filter(l => l.header === undefined).map(l => l.seq);
  const headersFromDb = await db.ledgerHeaders.findAllBySeq(seqNumsWithoutHeaders);

  return ledgers.map(l => {
    if (l.header) {
      return l.header;
    }

    return headersFromDb.find(h => h !== null && h.ledgerSeq === l.seq) || null;
  });
});

export default {
  Ledger: {
    header: ledgerHeaderResolver,
    transactions: async (root: Ledger, args: any, ctx: IApolloContext) => {
      return makeConnection<IHorizonTransactionData, Transaction>(
        await ctx.dataSources.transactions.forLedger(root.seq, args),
        r => TransactionWithXDRFactory.fromHorizon(r)
      );
    },
    operations: async (root: Ledger, args: any, ctx: IApolloContext) => {
      return makeConnection<IHorizonOperationData, Operation>(
        await ctx.dataSources.operations.forLedger(root.seq, args),
        r => OperationFactory.fromHorizon(r)
      );
    },
    payments: async (root: Ledger, args: any, ctx: IApolloContext) => {
      const records = await ctx.dataSources.payments.forLedger(root.seq, args);
      return makeConnection<IHorizonOperationData, Operation>(records, r => OperationFactory.fromHorizon(r));
    },
    effects: async (root: Ledger, args: any, ctx: IApolloContext) => {
      const records = await ctx.dataSources.effects.forLedger(root.id, args);
      return makeConnection<IHorizonEffectData, Effect>(records, r => EffectFactory.fromHorizon(r));
    }
  },
  Query: {
    ledger(root: any, args: any, ctx: IApolloContext, info: any) {
      return new Ledger(args.seq);
    },
    ledgers(root: any, args: any, ctx: IApolloContext, info: any) {
      return args.seq.map((seq: number) => new Ledger(seq));
    }
  },
  Subscription: {
    ledgerCreated: {
      resolve(payload: any, args: any, ctx: IApolloContext, info: any) {
        return payload;
      },
      subscribe() {
        return pubsub.asyncIterator(LEDGER_CREATED);
      }
    }
  }
};
