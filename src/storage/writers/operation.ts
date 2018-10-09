import { Transaction } from "../../model";
import { Connection } from "../connection";
import { Writer } from "./writer";

import { publicKeyFromBuffer } from "../../util/xdr/account";

import stellar from "stellar-base";

export interface IOperationUID {
  tx: string;
  ledger: string;
}

export class Operation extends Writer {
  private tx: Transaction;
  private xdr: any;
  private index: number;
  private uid: IOperationUID;

  constructor(connection: Connection, tx: Transaction, xdr: any, index: number, uid: IOperationUID) {
    super(connection);

    this.tx = tx;
    this.xdr = xdr;
    this.uid = uid;
    this.index = index;
  }

  public async write(): Promise<string> {
    const { prev, current } = await this.queryContext();
    const uid = this.newOrUID(current, "operation");

    let nquads = this.baseNQuads(uid);
    nquads += this.prevNQuads(uid, prev);
    nquads += this.sourceAccountIDNQuads(uid);
    nquads += await this.opTypeNQuads(uid);

    const result = await this.connection.push(nquads);
    return result.getUidsMap().get("operation") || current[0].uid;
  }

  protected async queryContext() {
    return this.connection.query(
      `
        query context($id: string, $prevIndex: int, $current: int) {          
          prev(func: eq(type, "operation")) @filter(eq(index, $prevIndex)) @cascade {
            uid
            transaction @filter(uid($id)) {
              uid
            }
          }

          current(func: eq(type, "operation")) @filter(eq(index, $current)) @cascade {
            uid
            transaction @filter(uid($id)) {
              uid
            }
          }
        }
      `,
      {
        $id: this.uid.tx,
        $prevIndex: (this.index - 1).toString(),
        $current: this.index.toString()
      }
    );
  }

  private baseNQuads(uid: string): string {
    return `
      ${uid} <type> "operation" .
      ${uid} <transaction> <${this.uid.tx}> .
      ${uid} <ledger> <${this.uid.ledger}> .
      ${uid} <index> "${this.index}" .
      ${uid} <kind> "${this.xdr.body().switch().name}" .
      ${uid} <sortHandle> "${this.sortHandle()}" .

      <${this.uid.tx}> <operations> ${uid} .
      <${this.uid.ledger}> <operations> ${uid} .
    `;
  }

  private sourceAccountIDNQuads(uid: string): string {
    const account = this.xdr.sourceAccount();

    if (account) {
      const id = publicKeyFromBuffer(account.value());

      return `
        ${uid} <sourceAccountID> "${id}" .
      `;
    }

    return "";
  }

  private async opTypeNQuads(uid: string): Promise<string> {
    const t = stellar.xdr.OperationType;

    switch (this.xdr.body().switch()) {
      case t.createAccount():
        return this.createAccountNQuads(uid);
    }

    return "";
  }

  private async createAccountNQuads(uid: string): Promise<string> {
    const op = this.xdr.body().createAccountOp();
    const destination = publicKeyFromBuffer(op.destination().value());
    const startingBalance = op.startingBalance().toString();
    const destinationAccount = await this.accountCache.fetch(destination);

    return `
      ${uid} <destination> "${destination}" .
      ${uid} <destinationAccount> ${destinationAccount} .
      ${uid} <startingBalance> "${startingBalance}" .

      ${destinationAccount} <operations> ${uid} .
    `;
  }

  private sortHandle(): string {
    return `${this.tx.ledgerSeq}-${this.tx.index}-${this.index}`;
  }
}
