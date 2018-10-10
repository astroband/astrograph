import { LedgerHeader } from "../../model";
import { Connection } from "../connection";
import * as nquads from "../nquads";
import { Query } from "./query";

export type IQueryResult = {
  current: nquads.UID | null,
  prev: nquads.UID | null
}

export class Ledger extends Query<IQueryResult> {
  private header: LedgerHeader;

  constructor(connection: Connection, header: LedgerHeader) {
    super(connection);
    this.header = header;
  }

  protected async call(): Promise<any> {
    const seq = this.header.ledgerSeq;

    return this.connection.query(
      `
        query context($current: int, $prev: int) {
          prev(func: eq(type, "ledger"), first: 1) @filter(eq(seq, $prev)) {
            uid
          }

          current(func: eq(type, "ledger"), first: 1) @filter(eq(seq, $current)) {
            uid
          }
        }
      `,
      {
        $current: seq.toString(),
        $prev: (seq - 1).toString()
      }
    );
  }

  public async results(): Promise<IQueryResult> {
    const r = await this.call();
    return {
      current: this.digUID(r, "current", 0, "uid"),
      prev: this.digUID(r, "prev", 0, "uid")
    };
  }
}
