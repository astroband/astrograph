import { LedgerHeader, Transaction } from "../model";
import { Connection } from "./connection";

import * as nquads from "./nquads";
import * as writers from "./writers";

export class Store {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async account(id: string): Promise<nquads.Value> {
    return (await writers.AccountWriter.build(this.connection, id)).write();
  }

  public async ledger(header: LedgerHeader): Promise<nquads.Value> {
    return (await writers.LedgerWriter.build(this.connection, header)).write();
  }

  public async transaction(transaction: Transaction): Promise<nquads.Value> {
    return (await writers.TransactionWriter.build(this.connection, transaction)).write();
  }
  //
  // public async operation(transaction: Transaction, index: number, args: any) {
  //   const { ledger, tx } = args;
  //
  //   return (await OperationFactory.produce(this.connection, transaction, index, { ledger, tx })).write();
  // }
}
