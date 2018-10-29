import { Memo, MemoText, MemoHash, MemoReturn } from "stellar-sdk";
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
  const memo = obj.memo as Memo;
  let value = memo.value;

  if (value instanceof Buffer) {
    switch(memo.type) {
      case MemoText:
        value = value.toString("utf8");
        break;
      case MemoHash:
      case MemoReturn:
        value = value.toString("base64");
        break;
    }
  }

  return {
    type: memo.type,
    value: value
  }
}

export function eventMatches(args: any, id: string, mutationType: MutationType): boolean {
  const idEq: boolean | null = args.idEq ? id === args.idEq : null;
  const idIn: boolean | null = args.idIn ? args.idIn.includes(id) : null;
  const mutationTypeIn: boolean | null = args.mutationTypeIn ? args.mutationTypeIn.includes(mutationType) : null;

  const conditions = [idEq, idIn, mutationTypeIn].filter(c => c !== null);

  return conditions.every(c => c === true);
}
