import { createBatchResolver as create } from "graphql-resolve-batch";
import { Ledger } from "../../model";

export function createBatchResolver<T, R>(loadFn: any) {
  return create<T, R>(async (source: ReadonlyArray<T>, args: any, context: any) => loadFn(source, args, context));
}

export function ledgerResolver(obj: any) {
  const seq = obj.lastModified || obj.ledgerSeq;
  return new Ledger(seq);
}

export function eventMatches(args: any, id: string): boolean {
  if (args.idEq) {
    return id === args.idEq;
  }

  if (args.idIn) {
    return args.idIn.includes(id);
  }

  return true;
}
