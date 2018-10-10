import { LedgerHeader, Transaction } from "../model";
import { Connection } from "./connection";
import { Value } from "./nquads";
import { LedgerFactory } from "./writers/ledger_factory";
import { OperationFactory } from "./writers/operation_factory";
import { TransactionFactory } from "./writers/transaction_factory";

export class Store {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async ledger(header: LedgerHeader): Promise<Value> {
    return (await LedgerFactory.produce(this.connection, header)).write();
  }

  public async transaction(transaction: Transaction, args: any): Promise<Value> {
    return (await TransactionFactory.produce(this.connection, transaction, args)).write();
  }

  public async operation(transaction: Transaction, index: number, args: any) {
    const { ledger, tx } = args;

    return (await OperationFactory.produce(this.connection, transaction, index, { ledger, tx })).write();
  }
}
