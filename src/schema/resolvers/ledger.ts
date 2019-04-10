import { db } from "../../database";
import { IHorizonEffectData, IHorizonOperationData, IHorizonTransactionData } from "../../datasource/types";
import { Effect, Ledger, LedgerHeader, Operation, Transaction } from "../../model";
import { EffectFactory, OperationFactory, TransactionWithXDRFactory } from "../../model/factories";
import { pubsub } from "../../pubsub";
import { createBatchResolver, makeConnection } from "./util";

const LEDGER_CREATED = "LEDGER_CREATED";

const ledgerHeaderResolver = createBatchResolver<Ledger, LedgerHeader>((source: any) =>
  db.ledgerHeaders.findAllBySeq(source.map((r: Ledger) => r.seq))
);

export default {
  Ledger: {
    header: ledgerHeaderResolver,
    transactions: async (root: Ledger, args: any, ctx: any) => {
      return makeConnection<IHorizonTransactionData, Transaction>(
        await ctx.dataSources.horizon.getLedgerTransactions(root.seq, args),
        r => TransactionWithXDRFactory.fromHorizon(r)
      );
    },
    operations: async (root: Ledger, args: any, ctx: any) => {
      return makeConnection<IHorizonOperationData, Operation>(
        await ctx.dataSources.operations.forLedger(root.seq, args),
        r => OperationFactory.fromHorizon(r)
      );
    },
    payments: async (root: Ledger, args: any, ctx: any) => {
      const records = await ctx.dataSources.payments.forLedger(root.seq, args);
      return makeConnection<IHorizonOperationData, Operation>(records, r => OperationFactory.fromHorizon(r));
    },
    effects: async (root: Ledger, args: any, ctx: any) => {
      const records = await ctx.dataSources.horizon.getTransactionEffects(root.id, args);
      return makeConnection<IHorizonEffectData, Effect>(records, r => EffectFactory.fromHorizon(r));
    }
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
