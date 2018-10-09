import { LedgerHeader, Transaction } from "../model";
import { Connection } from "./connection";
import { IValue } from "./nquads";
import { LedgerFactory } from "./writers/ledger_factory";
import { TransactionFactory } from "./writers/transaction_factory";
//import { IOperationUID, Operation } from "./writers/operation";
//import { ITxUID, Tx } from "./writers/tx";

export class Store {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async ledger(header: LedgerHeader): Promise<IValue> {
    return (await LedgerFactory.produce(this.connection, header)).write();
  }

  public async transaction(transaction: Transaction, args: any): Promise<IValue> {
    return (await TransactionFactory.produce(this.connection, transaction, args)).write();
  }
  //
  // public async operation(transaction: Transaction, operation: any, index: number, uid: IOperationUID) {
  //   return new Operation(this.connection, transaction, operation, index, uid).write();
  // }
}
