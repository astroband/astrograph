import { getRepository, In } from "typeorm";
import { IApolloContext } from "../../graphql_server";
import { Ledger, LedgerHeader as LedgerHeaderModel, Operation, PaymentOperations, Transaction } from "../../model";
import { LedgerHeaderFactory } from "../../model/factories";
import { LedgerHeader } from "../../orm/entities";
import { LEDGER_CREATED, pubsub } from "../../pubsub";
import {
  ITransactionData as IStorageTransactionData,
  OperationData as StorageOperationData
} from "../../storage/types";
import { createBatchResolver, makeConnection } from "./util";

const ledgerHeaderResolver = createBatchResolver<Ledger, LedgerHeader>(async (ledgers: Ledger[]) => {
  const seqNumsWithoutHeaders = ledgers.filter(l => l.header === undefined).map(l => l.seq);
  let fetchedHeaders: LedgerHeaderModel[] = [];

  if (seqNumsWithoutHeaders.length != 0) {
    fetchedHeaders = (await getRepository(LedgerHeader).find({ where: { seq: In(seqNumsWithoutHeaders) } })).map(h =>
      LedgerHeaderFactory.fromXDR(h.data)
    );
  }

  return ledgers.map(l => {
    return l.header || fetchedHeaders.find(h => h.ledgerSeq === l.seq) || null;
  });
});

export default {
  Ledger: {
    header: ledgerHeaderResolver,
    transactions: async (root: Ledger, args: any, ctx: IApolloContext) => {
      return makeConnection<IStorageTransactionData, Transaction>(
        await ctx.storage.transactions.forLedger(root.seq).all(args)
      );
    },
    operations: async (root: Ledger, args: any, ctx: IApolloContext) => {
      return makeConnection<StorageOperationData, Operation>(
        await ctx.storage.operations.forLedger(root.seq).all(args)
      );
    },
    payments: async (root: Ledger, args: any, ctx: IApolloContext) => {
      return makeConnection<StorageOperationData, Operation>(
        await ctx.storage.operations
          .forLedger(root.seq)
          .filterTypes(PaymentOperations)
          .all(args)
      );
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
