import { Ledger } from "../../../model";

export function ledgerResolver(obj: any) {
  const seq = obj.lastModified || obj.ledgerSeq;
  return new Ledger(seq);
}
