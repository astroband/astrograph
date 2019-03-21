import { createBatchResolver as create } from "graphql-resolve-batch";
import { Asset, Memo } from "stellar-sdk";
import { OperationsParent } from "../../datasource/horizon";
import { IHorizonOperationData, IHorizonTransactionData } from "../../datasource/types";
import { Account, Ledger, MutationType, Operation, Transaction } from "../../model";
import { OperationFactory, TransactionWithXDRFactory } from "../../model/factories";

export function createBatchResolver<T, R>(loadFn: any) {
  return create<T, R>(async (source: ReadonlyArray<T>, args: any, context: any) => loadFn(source, args, context));
}

export function ledgerResolver(obj: any) {
  const seq = obj.lastModified || obj.ledgerSeq;
  return new Ledger(seq);
}

export function memoResolver(obj: any) {
  if (!obj.memo) {
    return null;
  }

  const memo = obj.memo as Memo;

  return {
    type: memo.type,
    value: memo.getPlainValue()
  };
}

export function assetResolver(obj: any, args: any, ctx: any, info: any) {
  const field = info.fieldName || "asset";
  const asset = obj[field] as Asset;
  return {
    code: asset.getCode(),
    issuer: asset.getIssuer(),
    native: asset.isNative()
  };
}

export function eventMatches(args: any, id: string, mutationType: MutationType): boolean {
  const idEq: boolean | null = args.idEq ? id === args.idEq : null;
  const idIn: boolean | null = args.idIn ? args.idIn.includes(id) : null;
  const mutationTypeIn: boolean | null = args.mutationTypeIn ? args.mutationTypeIn.includes(mutationType) : null;

  const conditions = [idEq, idIn, mutationTypeIn].filter(c => c !== null);

  return conditions.every(c => c === true);
}

export async function operationsResolver(obj: any, args: any, ctx: any) {
  let parent: OperationsParent;

  if (obj instanceof Transaction) {
    parent = "transaction";
  } else if (obj instanceof Account) {
    parent = "account";
  } else if (obj instanceof Ledger) {
    parent = "ledger";
  } else {
    throw new Error(`Cannot fetch operations for ${obj.constructor}`);
  }

  const { first, after, last, before } = args;
  let data = await ctx.dataSources.horizon.getOperations(
    parent,
    obj.id,
    first || last,
    last ? "asc" : "desc",
    last ? before : after
  );

  // we must keep descending ordering, because Horizon doesn't do it,
  // when you request the previous page
  if (last) {
    data = data.reverse();
  }

  const edges = data.map((record: IHorizonOperationData) => {
    return {
      node: OperationFactory.fromHorizon(record),
      cursor: record.paging_token
    };
  });

  return {
    nodes: edges.map((edge: { node: Operation; cursor: string }) => edge.node),
    edges,
    pageInfo: {
      startCursor: data.length !== 0 ? data[0].paging_token : null,
      endCursor: data.length !== 0 ? data[data.length - 1].paging_token : null
    }
  };
}

export async function transactionsResolver(obj: any, args: any, ctx: any) {
  let data: IHorizonTransactionData[];
  const dataSource = ctx.dataSources.horizon;
  const { first, after, last, before } = args;
  const pagingArgs = [first || last, last ? "asc" : "desc", last ? before : after];

  if (obj instanceof Ledger) {
    data = await dataSource.getLedgerTransactions(obj.id, ...pagingArgs);
  } else if (obj instanceof Account) {
    data = await dataSource.getAccountTransactions(obj.id, ...pagingArgs);
  } else {
    throw new Error(`Cannot fetch operations for ${obj.constructor}`);
  }

  // we must keep descending ordering, because Horizon doesn't do it,
  // when you request the previous page
  if (last) {
    data = data.reverse();
  }

  const edges = data.map((record: IHorizonTransactionData) => {
    return {
      node: TransactionWithXDRFactory.fromHorizon(record),
      cursor: record.paging_token
    };
  });

  return {
    nodes: edges.map((edge: { node: Transaction; cursor: string }) => edge.node),
    edges,
    pageInfo: {
      startCursor: data.length !== 0 ? data[0].paging_token : null,
      endCursor: data.length !== 0 ? data[data.length - 1].paging_token : null
    }
  };
}
