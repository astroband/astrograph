import { fieldsList } from "graphql-fields-list";
import { createBatchResolver as create } from "graphql-resolve-batch";
import { Asset, Memo } from "stellar-sdk";
import { db } from "../../database";
import HorizonAPI from "../../datasource/horizon";
import { IHorizonOperationData, IHorizonTransactionData } from "../../datasource/types";
import { Account, AccountID, Ledger, MutationType, Transaction } from "../../model";
import { OperationFactory, TransactionWithXDRFactory } from "../../model/factories";

export function createBatchResolver<T, R>(loadFn: any) {
  return create<T, R>(async (source: ReadonlyArray<T>, args: any, context: any, info: any) =>
    loadFn(source, args, context, info)
  );
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

export const accountResolver = createBatchResolver<any, Account[]>(
  (source: any, args: any, context: any, info: any) => {
    const requestedFields = fieldsList(info);
    const ids: AccountID[] = source.map((s: any) => s[info.fieldName]);

    // if user requested only "id", we can return it right away
    if (requestedFields.length === 1 && requestedFields[0] === "id") {
      return ids.map(id => (id ? { id } : null));
    }

    return db.accounts.findAllByIDs(ids);
  }
);

export function assetResolver(obj: any, args: any, ctx: any, info: any) {
  const field = info.fieldName || "asset";
  const asset = obj[field] as Asset;

  const res = (a: Asset): any => {
    return { code: a.getCode(), issuer: a.getIssuer(), native: a.isNative() };
  };

  if (Array.isArray(asset)) {
    return asset.map(a => res(a));
  }

  return res(asset);
}

export function eventMatches(args: any, id: string, mutationType: MutationType): boolean {
  const idEq: boolean | null = args.idEq ? id === args.idEq : null;
  const idIn: boolean | null = args.idIn ? args.idIn.includes(id) : null;
  const mutationTypeIn: boolean | null = args.mutationTypeIn ? args.mutationTypeIn.includes(mutationType) : null;

  const conditions = [idEq, idIn, mutationTypeIn].filter(c => c !== null);

  return conditions.every(c => c === true);
}

export async function operationsResolver(obj: any, args: any, ctx: any) {
  let data: IHorizonOperationData[];
  const dataSource: HorizonAPI = ctx.dataSources.horizon;
  const { first, after, last, before } = args;
  const pagingArgs = [first || last, last && before ? "asc" : "desc", last ? before : after];

  if (obj instanceof Transaction) {
    data = await dataSource.getTransactionOperations(obj.id, ...pagingArgs);
  } else if (obj instanceof Account) {
    data = await dataSource.getAccountOperations(obj.id, ...pagingArgs);
  } else if (obj instanceof Ledger) {
    data = await dataSource.getLedgerOperations(obj.id, ...pagingArgs);
  } else if (obj === undefined) {
    data = await dataSource.getOperations(...pagingArgs);
  } else {
    throw new Error(`Cannot fetch operations for ${obj.constructor}`);
  }

  // we must keep descending ordering, because Horizon doesn't do it,
  // when you request the previous page
  if (last && before) {
    data = data.reverse();
  }

  const edges = data.map((record: IHorizonOperationData) => {
    return {
      node: OperationFactory.fromHorizon(record),
      cursor: record.paging_token
    };
  });

  return {
    nodes: edges.map(edge => edge.node),
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
  const pagingArgs = [first || last, last && before ? "asc" : "desc", last ? before : after];

  if (obj instanceof Ledger) {
    data = await dataSource.getLedgerTransactions(obj.id, ...pagingArgs);
  } else if (obj instanceof Account) {
    data = await dataSource.getAccountTransactions(obj.id, ...pagingArgs);
  } else {
    throw new Error(`Cannot fetch operations for ${obj.constructor}`);
  }

  // we must keep descending ordering, because Horizon doesn't do it,
  // when you request the previous page
  if (last && before) {
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
