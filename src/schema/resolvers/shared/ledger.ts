import { Ledger } from "../../../model";

export function ledger(obj: any) {
  const seq = obj.lastModified || obj.ledgerSeq;
  return new Ledger(seq);
}
