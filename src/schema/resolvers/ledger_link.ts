import db from "../../database";
import { Ledger, LedgerLink } from "../../model";
import { createBatchResolver } from "./util";

const ledgerResolver = createBatchResolver<LedgerLink, Ledger>((source: any) =>
  db.ledgers.findAllBySeq(source.map((r: LedgerLink) => r.ledgerSeq))
);

export default {
  LedgerLink: {
    ledger: ledgerResolver
  }
};
