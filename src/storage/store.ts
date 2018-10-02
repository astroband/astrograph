import { LedgerHeader } from "../model";
import { Connection } from "./connection";

const queries = {
  prevNextLedger: `
    query prevNext($prev: int, $next: int, $current: int) {
      prev(func: eq(type, "ledger")) @filter(eq(seq, $prev)) {
        seq
        uid
      }

      current(func: eq(type, "ledger")) @filter(eq(seq, $current)) {
        seq
        uid
      }

      next(func: eq(type, "ledger")) @filter(eq(seq, $next)) {
        seq
        uid
      }
    }
  `
};

export class Store {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async header(header: LedgerHeader) {
    // FIXME: Not working without .toString(), hmmm
    const vars = {
      $prev: (header.ledgerSeq - 1).toString(),
      $next: (header.ledgerSeq + 1).toString(),
      $current: header.ledgerSeq.toString()
    };

    const result = await this.connection.query(queries.prevNextLedger, vars);
    const current = result.current[0] ? `<${result.current[0].uid}>` : "_:ledger";
    const prev = result.prev[0];
    const next = result.next[0];

    let nquads = `
      ${current} <type> "ledger" .
      ${current} <seq> "${header.ledgerSeq}" .
      ${current} <version> "${header.ledgerVersion}" .
      ${current} <baseFee> "${header.baseFee}" .
      ${current} <baseReserve> "${header.baseReserve}" .
      ${current} <maxTxSetSize> "${header.maxTxSetSize}" .
    `;

    if (prev) {
      nquads += `
        ${current} <prev> <${prev.uid}> .
        <${prev.uid}> <next> ${current} .
      `;
    }

    if (next) {
      nquads += `
        ${current} <next> <${next.uid}> .
        <${next.uid}> <prev> ${current} .
      `;
    }

    await this.connection.push(nquads);
  }
}
