import { Ledger } from "../../../model";

export function ledger(obj: any) {
  const seq = obj.lastModified || obj.lastModifiedIn || obj.ledgerSeq;
  return new Ledger(seq);
}
