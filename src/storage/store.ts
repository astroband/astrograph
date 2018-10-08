import { LedgerHeader, Transaction } from "../model";
import { Connection } from "./connection";
import { Ledger } from "./writers/ledger";
import { Operation } from "./writers/operation";
import { Tx } from "./writers/tx";

export class Store {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async ledger(header: LedgerHeader): Promise<string> {
    return new Ledger(this.connection, header).write();
  }

  public async transaction(transaction: Transaction, ledgerUID: string): Promise<string> {
    return new Tx(this.connection, transaction, ledgerUID).write();
  }

  public async operation(operation: any, txUID: string, index: number) {
    return new Operation(this.connection, operation, txUID, index).write();
  }
}
