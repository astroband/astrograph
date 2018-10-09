import { LedgerHeader, Transaction } from "../model";
import { Connection } from "./connection";
import { IValue } from "./nquads";
import { LedgerFactory } from "./writers/ledger_factory";
import { TransactionWriter, IArgs as ITransactionWriterArgs } from "./writers/transaction";
//import { IOperationUID, Operation } from "./writers/operation";
//import { ITxUID, Tx } from "./writers/tx";


export class Store {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async ledger(header: LedgerHeader): Promise<IValue> {
    return LedgerFactory.produce(this.connection, header).write();
  }

  public async transaction(transaction: Transaction, args: ITransactionWriterArgs): Promise<string> {
    // return TransactionWriter.write(this.connection, transaction, args);
  }
  //
  // public async operation(transaction: Transaction, operation: any, index: number, uid: IOperationUID) {
  //   return new Operation(this.connection, transaction, operation, index, uid).write();
  // }
}
