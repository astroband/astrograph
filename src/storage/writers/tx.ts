import { Transaction } from "../../model";
import { Connection } from "../connection";
import { Operation } from "./operation";
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
    const { prevTree, next, current } = await this.queryContext();
    const uid = this.newOrUID(current, "transaction");
    const prev = this.findPrev(prevTree);

    let nquads = this.baseNQuads(uid);
    nquads += this.prevNQuads(uid, prev);
    nquads += this.nextNQuads(uid, next);
    nquads += this.memoNQuads(uid, current);
    nquads += this.timeBoundsNQuads(uid);

    const result = await this.connection.push(nquads);
    const txUID = result.getUidsMap().get("transaction") || current[0].uid;
    const ops = this.operations();

    for (let index = 0; index < ops.length; index++) {
      await new Operation(this.connection, ops[index], txUID, index); // .write();
    }

    return txUID;
  }

  // Returns prev/next transactions within ledger.
  //
  // We assume that all ledgers are ingested in full, including all underlying transactions, operations
  // and all other entities.
  //
  // prevTree finds previous lastest transaction within linked list of ledgers and ensures the chain is
  // consistent. For example, if you have ingested ledgers 100-200 and then decide to ingest ledgers 500-600,
  // first transaction from ledger 500 should have blank previous transaction because it is missing in database.
  //
  // `depth` sets the maximum number of ledgers in row containing zero transactions.
  protected async queryContext(): Promise<any> {
    return this.connection.query(
      `
        query context(
          $id: string,
          $seq: string,
          $ledger: string,
          $prevIndex: int,
          $nextIndex: int
        ) {
          prevTree(func: uid($ledger), orderdesc: seq) @recurse(depth: 20, loop: true) {
            uid
            index
            seq

            transactions(orderdesc: index) {
              uid
              index
            }

            prev
          }

          next(func: eq(type, "transaction"), first: 1) @filter(eq(seq, $seq) AND eq(index, $nextIndex)) {
            uid
          }

          current(func: eq(type, "transaction"), first: 1) @filter(eq(id, $id)) {
            uid
            memo {
              uid
            }
          }
        }
      `,
      {
        $seq: this.tx.ledgerSeq.toString(),
        $ledger: this.ledgerUID,
        $nextIndex: (this.tx.index + 1).toString(),
        $id: this.tx.id
      }
    );
  }

  private baseNQuads(uid: string): string {
    return `
      ${uid} <type> "transaction" .
      ${uid} <id> "${this.tx.id}" .
      ${uid} <index> "${this.tx.index}" .
      ${uid} <seq> "${this.tx.ledgerSeq}" .
      ${uid} <ledger> <${this.ledgerUID}> .
      ${uid} <sortHandle> "${this.sortHandle()}" .
      ${uid} <feeAmount> "${this.tx.feeAmount}" .
      ${uid} <sourceAccountID> "${this.tx.sourceAccount}" .

      <${this.ledgerUID}> <transactions> ${uid} .
    `;
  }

  private memoNQuads(uid: string, current: any): string {
    const memo = this.tx.memo;

    if (!memo) {
      return "";
    }

    const memoUID =
      current && current[0] && current[0].memo && current[0].memo[0] ? `<${current[0].memo[0].uid}>` : "_:ledger";

    const s = `
      ${memoUID} <type> "${memo.type.toString()}" .
      ${memoUID} <value> "${memo.value}" .

      ${uid} <memo> ${memoUID} .
      ${memoUID} <transaction> ${uid} .
    `;

    return s;
  }

  private timeBoundsNQuads(uid: string): string {
    if (!this.tx.timeBounds) {
      return "";
    }

    return `
      ${uid} <time_bound_min> "${this.tx.timeBounds[0]}" .
      ${uid} <time_bound_max> "${this.tx.timeBounds[1]}" .
    `;
  }

  private sortHandle(): string {
    return `${this.tx.ledgerSeq}-${this.tx.index}`;
  }

  private operations() {
    return this.tx.envelopeXDR.tx().operations();
  }

  private findPrev(prev: any): string | null {
    if (!prev) {
      return null;
    }

    // Find previous transaction in current ledger transactions
    const current = (prev.transactions || []).find((tx: any) => {
      return tx.index === this.tx.index - 1;
    });

    if (current) {
      return current;
    }

    // Try to find previous transaction in current ledger blocks
    return this.walkInPrev(prev.prev);
  }

  private walkInPrev(prev: any): string | null {
    if (!prev || !prev[0]) {
      return null;
    }

    if (prev[0].transactions) {
      return prev[0].transactions[0];
    }

    return this.walkInPrev(prev[0].prev);
  }
}
