import { Transaction } from "../../model";
import { Connection } from "../connection";
//import { Operation } from "./operation";
import { Writer } from "./writer";

export class Tx extends Writer {
  private tx: Transaction;
  private ledgerUID: string;

  constructor(connection: Connection, tx: Transaction, ledgerUID: string) {
    super(connection);
    this.tx = tx;
    this.ledgerUID = ledgerUID;
  }

  public async write(): Promise<string> {
    const { prev, next, current } = await this.prevNextCurrent(this.vars());
    const uid = this.newOrUID(current, "transaction");

    let nquads = this.baseNQuads(uid);
    nquads += this.prevNQuads(uid, prev);
    nquads += this.nextNQuads(uid, next);

    const result = await this.connection.push(nquads);
    const txUID = result.getUidsMap().get("transaction") || current.uid;

    console.log(this.tx.envelopeXDR.operations());
    // this.tx.envelopeXDR.operations().forEach(async (op: any, index: number) => {
    //   console.log("OPER!!!");
    //   await (new Operation(this.connection, txUID, op, index)).write();
    // });

    return txUID;
  }

  protected prevNextCurrentQuery() {
    return `
      query prevNextCurrent($id: string, $seq: string, $prevIndex: int, $nextIndex: int) {
        prev(func: eq(type, "transaction")) @filter(eq(seq, $seq) AND eq(index, $prevIndex)) {
          uid
        }

        next(func: eq(type, "transaction")) @filter(eq(seq, $seq) AND eq(index, $nextIndex)) {
          uid
        }

        current(func: eq(type, "transaction")) @filter(eq(id, $id)) {
          uid
        }
      }
    `;
  }

  private baseNQuads(uid: string): string {
    return `
      ${uid} <type> "transaction" .
      ${uid} <id> "${this.tx.id}" .
      ${uid} <seq> "${this.tx.ledgerSeq}" .
      ${uid} <index> "${this.tx.index}" .
      ${uid} <ledger> <${this.ledgerUID}> .

      <${this.ledgerUID}> <transactions> ${uid} .
    `;
  }

  private vars(): any {
    return {
      $seq: this.tx.ledgerSeq.toString(),
      $prevIndex: (this.tx.index - 1).toString(),
      $nextIndex: (this.tx.index + 1).toString(),
      $id: this.tx.id
    };
  }
}
