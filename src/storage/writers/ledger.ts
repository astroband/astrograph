import { LedgerHeader } from "../../model";
import { Connection } from "../connection";
import { Writer } from "./writer";

import * as nquads from "../nquads";

interface IContext {
  current: nquads.IValue;
  prev: nquads.IValue | null;
}

export class LedgerWriter extends Writer {
  public static async write(connection: Connection, header: LedgerHeader): Promise<nquads.IValue> {
    const context = await this.queryContext(connection, header.ledgerSeq);

    const current = nquads.UID.from(context.current) || new nquads.Blank("ledger");
    const prev = nquads.UID.from(context.prev);

    return new LedgerWriter(connection, header, { current, prev }).write();
  }

  // Returns prev and next ledger uids, ledger sequence is contniuous, must not contain gaps.
  // It is primary criteria for prev/next indexing of all objects in graph.
  private static queryContext(connection: Connection, seq: number): Promise<any> {
    return connection.query(
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
        $prev: (seq - 1).toString(),
        $current: seq.toString()
      }
    );
  }

  private header: LedgerHeader;
  private context: IContext;

  private constructor(connection: Connection, header: LedgerHeader, context: IContext) {
    super(connection);

    this.header = header;
    this.context = context;
  }

  public async write(): Promise<nquads.IValue> {
    const { current, prev } = this.context;

    this.b
      .for(current)
      .append("type", "ledger")
      .append("seq", this.header.ledgerSeq)
      .append("sortHandle", this.header.ledgerSeq)
      .append("version", this.header.ledgerVersion)
      .append("baseFee", this.header.baseFee)
      .append("baseReserve", this.header.baseReserve)
      .append("maxTxSetSize", this.header.maxTxSetSize);

    if (prev) {
      this.b.append(current, "prev", prev).append(prev, "next", current);
    }

    const created = await this.push("ledger");
    return created || current;
  }
}
