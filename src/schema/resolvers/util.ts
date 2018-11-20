import { Asset, Memo } from "stellar-sdk";
import { createBatchResolver as create } from "graphql-resolve-batch";
import { Ledger, MutationType } from "../../model";

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

export function assetResolver(obj: any) {
  const asset = obj.asset as Asset;
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
