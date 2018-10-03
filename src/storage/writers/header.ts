import { LedgerHeader } from "../../model";
import { Connection } from "../connection";
import { Writer } from "./writer";

export class Header extends Writer {
  private header: LedgerHeader;

  constructor(connection: Connection, header: LedgerHeader) {
    super(connection);
    this.header = header;
  }

  public async write(): Promise<string> {
    const { prev, next, current } = await this.prevNextCurrent(this.vars());
    const uid = current ? `<${current.uid}>` : "_:ledger";

    let nquads = this.baseNQuads(uid);
    nquads += this.prevNQuads(uid, prev);
    nquads += this.nextNQuads(uid, next);

    const result = await this.connection.push(nquads);
    return result.getUidsMap().get("ledger") || current.uid;
  }

  protected prevNextCurrentQuery(): string {
    return `
      query prevNextCurrent($prev: int, $next: int, $current: int) {
        prev(func: eq(type, "ledger")) @filter(eq(seq, $prev)) {
          uid
        }

        next(func: eq(type, "ledger")) @filter(eq(seq, $next)) {
          uid
        }

        current(func: eq(type, "ledger")) @filter(eq(seq, $current)) {
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
}
