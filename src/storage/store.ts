import { LedgerHeader, Transaction } from "../model";
import { Connection } from "./connection";
import { Ledger } from "./writers/ledger";
import { IOperationUID, Operation } from "./writers/operation";
import { ITxUID, Tx } from "./writers/tx";

export class Store {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async ledger(header: LedgerHeader): Promise<string> {
    return new Ledger(this.connection, header).write();
  }

  public async transaction(transaction: Transaction, uid: ITxUID): Promise<string> {
    return new Tx(this.connection, transaction, uid).write();
  }

  public async operation(transaction: Transaction, operation: any, index: number, uid: IOperationUID) {
    return new Operation(this.connection, transaction, operation, index, uid).write();
  }
}
