import { LedgerHeader } from "../model";
import { Connection } from "./connection";

const queries = {
  prevNextLedger: `
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
  `,
  ledgerAndTransaction: `
    query ledgerAndTransaction($seq: int, $id: id) {
      ledger(func: eq(type, "ledger")) @filter(eq(seq, $seq)) {
        uid
      }

      transaction(func: eq(type, "transaction")) @filter(eq(id, $id)) {
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

  public async header(header: LedgerHeader): Promise<string> {
    const vars = {
      $prev: (header.ledgerSeq - 1).toString(),
      $next: (header.ledgerSeq + 1).toString(),
      $current: header.ledgerSeq.toString()
    };

    const ledgers = await this.connection.query(queries.prevNextLedger, vars);
    const current = ledgers.current[0];
    const uid = current ? `<${current.uid}>` : "_:ledger";
    const prev = ledgers.prev[0];
    const next = ledgers.next[0];

    let nquads = `
      ${uid} <type> "ledger" .
      ${uid} <seq> "${header.ledgerSeq}" .
      ${uid} <version> "${header.ledgerVersion}" .
      ${uid} <baseFee> "${header.baseFee}" .
      ${uid} <baseReserve> "${header.baseReserve}" .
      ${uid} <maxTxSetSize> "${header.maxTxSetSize}" .
    `;

    if (prev) {
      nquads += `
        ${uid} <prev> <${prev.uid}> .
        <${prev.uid}> <next> ${uid} .
      `;
    }

    if (next) {
      nquads += `
        <${next.uid}> <prev> ${uid} .
        ${uid} <next> <${next.uid}> .
      `;
    }

    const result = await this.connection.push(nquads);
    return result.getUidsMap().get("ledger") || current.uid;
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
