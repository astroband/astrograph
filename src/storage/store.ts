import { LedgerHeader } from "../model";
import { Connection } from "./connection";
import { Header } from "./writers/header";

// const queries = {
//   prevNextLedger: `
//     query prevNext($prev: int, $next: int, $current: int) {
//       prev(func: eq(type, "ledger")) @filter(eq(seq, $prev)) {
//         uid
//       }
//
//       current(func: eq(type, "ledger")) @filter(eq(seq, $current)) {
//         uid
//       }
//
//       next(func: eq(type, "ledger")) @filter(eq(seq, $next)) {
//         uid
//       }
//     }
//   `,
//   ledgerAndTransaction: `
//     query ledgerAndTransaction($seq: int, $id: id) {
//       ledger(func: eq(type, "ledger")) @filter(eq(seq, $seq)) {
//         uid
//       }
//
//       transaction(func: eq(type, "transaction")) @filter(eq(id, $id)) {
//         uid
//       }
//     }
//   `
// };

export class Store {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async header(header: LedgerHeader): Promise<string> {
    return new Header(this.connection, header).write();
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
