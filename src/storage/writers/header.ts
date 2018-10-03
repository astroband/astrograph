import { LedgerHeader } from "../../model";
import { Connection } from "../connection";
import { Writer } from "./writer";

export class Header extends Writer {
  private query: string = `
    query prevNext($prev: int, $next: int, $current: int) {
      prev(func: eq(type, "ledger")) @filter(eq(seq, $prev)) {
        uid
      }

      current(func: eq(type, "ledger")) @filter(eq(seq, $current)) {
        uid
      }

      next(func: eq(type, "ledger")) @filter(eq(seq, $next)) {
        uid
      }
    }
  `;

  private header: LedgerHeader;

  constructor(connection: Connection, header: LedgerHeader) {
    super(connection);
    this.header = header;
  }

  public async write(): Promise<string> {
    const { prev, next, current } = await this.prevNextCurrent();
    const uid = current ? `<${current.uid}>` : "_:ledger";

    let nquads = this.baseNQuads(uid);
    nquads += this.prevNQuads(uid, prev);
    nquads += this.nextNQuads(uid, next);

    const result = await this.connection.push(nquads);
    return result.getUidsMap().get("ledger") || current.uid;
  }

  private async prevNextCurrent(): Promise<any> {
    const vars = {
      $prev: (this.header.ledgerSeq - 1).toString(),
      $next: (this.header.ledgerSeq + 1).toString(),
      $current: this.header.ledgerSeq.toString()
    };

    const ledgers = await this.connection.query(this.query, vars);
    const current = ledgers.current[0];
    const prev = ledgers.prev[0];
    const next = ledgers.next[0];

    return { prev, next, current };
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

  private prevNQuads(uid: string, prev: any): string {
    if (prev) {
      return `
        ${uid} <prev> <${prev.uid}> .
        <${prev.uid}> <next> ${uid} .
      `;
    }

    return "";
  }

  private nextNQuads(uid: string, next: any): string {
    if (next) {
      return `
        <${next.uid}> <prev> ${uid} .
        ${uid} <next> <${next.uid}> .
      `;
    }

    return "";
  }

  // public async transaction(tx: Transaction) {
  //   const ledgerAndTransaction = await this.connection.query(
  //     queries.ledgerAndTransaction,
  //     { seq: tx.ledgerSeq, id: tx.id }
  //   );
  //
  //   const ledger = ledgerAndTransaction.ledger[0];
  //   const transaction = ledgerAndTransaction.transaction[0];
  //
  //   let nquads = `
  //
  //   `;
  //
  //   if (ledger) {
  //
  //   }
  // }
}
