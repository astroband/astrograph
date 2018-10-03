import { Transaction } from "../../model";
import { Connection } from "../connection";
import { Writer } from "./writer";

export class Tx extends Writer {
  private tx: Transaction;
  private ledgerUID: string;

  private queries = {
    prevNextCurrent: `
      query prevNextCurrent($id: string, $prevIndex: int, $nextIndex: int) {
        prev(func: eq(type, "transaction")) @filter(eq(seq, $seq) AND eq(index, $prevIndex)) {
          uid
        }

        next(func: eq(type, "transaction")) @filter(eq(seq, $seq) AND eq(index, $prevIndex)) {
          uid
        }

        current(func: eq(type, "transaction")) @filter(eq(id, $id)) {
          uid
        }
      }
    `
  }

  constructor(connection: Connection, tx: Transaction, ledgerUID: string) {
    super(connection);
    this.tx = tx;
    this.ledgerUID = ledgerUID;
  }

  public async write(): Promise<string> {

  }

  private baseNQuads(uid: string): string {
    return `
      ${uid} <id> ${this.tx.id}
      ${uid} <seq> ${this.tx.ledgerSeq}
      ${uid} <index> ${this.tx.index}
    `;
  }
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
