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
    const { prev, current } = await this.queryContext();
    const uid = this.newOrUID(current, "ledger");

    let nquads = this.baseNQuads(uid);
    nquads += this.prevNQuads(uid, prev);

    const result = await this.connection.push(nquads);
    return result.getUidsMap().get("ledger") || current[0].uid;
  }

  // Returns prev and next ledger uids, ledger sequence is contniuous, must not contain gaps.
  // It is primary criteria for prev/next indexing of all objects in graph.
  private async queryContext(): Promise<any> {
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
