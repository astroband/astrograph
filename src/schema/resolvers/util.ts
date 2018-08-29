import { createBatchResolver as create } from "graphql-resolve-batch";
import { LedgerLink } from "../../model";

export function createBatchResolver<T, R>(loadFn: any) {
  return create<T, R>(async (source: ReadonlyArray<T>, args: any, context: any) => loadFn(source, args, context));
}

export function ledgerLinkResolver(obj: any) {
  const seq = obj.lastModified || obj.ledgerSeq;
  return new LedgerLink(seq);
}
