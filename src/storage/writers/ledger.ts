import { LedgerHeader } from "../../model";
import { Connection } from "../connection";
import { Writer } from "./writer";

export class Ledger extends Writer {
  private header: LedgerHeader;

  constructor(connection: Connection, header: LedgerHeader) {
    super(connection);
    this.header = header;
  }

  public async write(): Promise<string> {
    const { prev, next, current } = await this.queryContext(this.vars());
    const uid = this.newOrUID(current, "ledger");

    let nquads = this.baseNQuads(uid);
    nquads += this.prevNQuads(uid, prev);
    nquads += this.nextNQuads(uid, next);

    const result = await this.connection.push(nquads);
    return result.getUidsMap().get("ledger") || current.uid;
  }

  // Returns prev and next ledger uids, ledger sequence is contniuous, must not contain gaps.
  // It is primary criteria for prev/next indexing of all objects in graph.
  protected contextQuery(): string {
    return `
      query context($prev: int, $next: int, $current: int) {
        prev(func: eq(type, "ledger"), first: 1) @filter(eq(seq, $prev)) {
          uid
        }

        next(func: eq(type, "ledger"), first: 1) @filter(eq(seq, $next)) {
          uid
        }

        current(func: eq(type, "ledger"), first: 1) @filter(eq(seq, $current)) {
          uid
        }
      }
    `;
  }

  private vars(): any {
    return {
      $prev: (this.header.ledgerSeq - 1).toString(),
      $next: (this.header.ledgerSeq + 1).toString(),
      $current: this.header.ledgerSeq.toString()
    };
  }

  private baseNQuads(uid: string): string {
    return `
      ${uid} <type> "ledger" .
      ${uid} <seq> "${this.header.ledgerSeq}" .
      ${uid} <version> "${this.header.ledgerVersion}" .
      ${uid} <baseFee> "${this.header.baseFee}" .
      ${uid} <baseReserve> "${this.header.baseReserve}" .
      ${uid} <maxTxSetSize> "${this.header.maxTxSetSize}" .
    `;
  }
}
