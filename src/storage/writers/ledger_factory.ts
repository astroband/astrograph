import { LedgerHeader } from "../../model";
import { Connection } from "../connection";
import { LedgerWriter } from "./ledger_writer";
import { Writer } from "./writer";
import { WriterFactory } from "./writer_factory";

import * as nquads from "../nquads";

export class LedgerFactory extends WriterFactory {
  public static async produce(connection: Connection, header: LedgerHeader): Promise<Writer> {
    return new LedgerFactory(connection, header).produce();
  }

  private header: LedgerHeader;

  constructor(connection: Connection, header: LedgerHeader) {
    super(connection);
    this.header = header;
  }

  public async produce(): Promise<Writer> {
    const context = await this.queryContext();

    const current = nquads.UID.from(context.current) || new nquads.Blank("ledger");
    const prev = nquads.UID.from(context.prev);

    return new LedgerWriter(this.connection, this.header, { current, prev });
  }

  // Returns prev and next ledger uids, ledger sequence is contniuous, must not contain gaps.
  // It is primary criteria for prev/next indexing of all objects in graph.
  private queryContext(): Promise<any> {
    return this.connection.query(
      `
        query context($prev: int, $next: int, $current: int) {
          prev(func: eq(type, "ledger"), first: 1) @filter(eq(seq, $prev)) {
            uid
          }

          current(func: eq(type, "ledger"), first: 1) @filter(eq(seq, $current)) {
            uid
          }
        }
      `,
      {
        $prev: (this.header.ledgerSeq - 1).toString(),
        $current: this.header.ledgerSeq.toString()
      }
    );
  }
}
