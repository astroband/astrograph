import { createBatchResolver as create } from "graphql-resolve-batch";
import { Ledger, MutationType } from "../../model";

export function createBatchResolver<T, R>(loadFn: any) {
  return create<T, R>(async (source: ReadonlyArray<T>, args: any, context: any) => loadFn(source, args, context));
}

export function ledgerResolver(obj: any) {
  const seq = obj.lastModified || obj.ledgerSeq;
  return new Ledger(seq);
}

export function eventMatches(args: any, id: string, mutationType: MutationType): boolean {
  const idEq: boolean | null = args.idEq ? id === args.idEq : null;
  const idIn: boolean | null = args.idIn ? args.idIn.includes(id) : null;
  const mutationTypeEq: boolean | null = args.mutationTypeEq ? args.mutationTypeEq.includes(mutationType) : null;

  const conditions = [idEq, idIn, mutationTypeEq].filter(c => c !== null);

  return conditions.every(c => c === true);
}
