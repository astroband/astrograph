import { LedgerHeader } from "../../model";
import { Connection } from "../connection";
import { WriterFactory } from "./writer_factory";
import { LedgerWriter } from "./ledger_writer";

import * as nquads from "../nquads";

interface IContext {
  current: nquads.IValue;
  prev: nquads.IValue | null;
}

export class LedgerFactory extends WriterFactory {
  private header: LedgerHeader;

  public static async produce(connection: Connection, header: LedgerHeader): Writer {
    return new LedgerFactory(connection, header).produce();
  }

  constructor(connection: Connection, header: LedgerHeader) {
    super(connection);
    this.header = header;
  }

  public async produce(): Writer {
    const context = await this.queryContext();

    const current = nquads.UID.from(context.current) || new nquads.Blank("ledger");
    const prev = nquads.UID.from(context.prev);

    return new LedgerWriter(connection, header, { current, prev }).write();
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
