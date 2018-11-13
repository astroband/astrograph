import { Asset } from "stellar-sdk";
import { LedgerHeader, Transaction } from "../model";
import { Connection } from "./connection";

import { LedgerBuilder } from "../storage2/builders/ledger";
import { Cache } from "../storage2/cache";

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

  public async asset(asset: Asset): Promise<nquads.Value> {
    return (await writers.AssetWriter.build(this.connection, asset)).write();
  }

  public async ledger(header: LedgerHeader): Promise<nquads.Value> {
    return (await writers.LedgerWriter.build(this.connection, header)).write();
  }

  public async transaction(transaction: Transaction): Promise<nquads.Value> {
    return (await writers.TransactionWriter.build(this.connection, transaction)).write();
  }

  public async operation(transaction: Transaction, index: number) {
    return (await writers.OperationWriter.build(this.connection, transaction, index)).write();
  }

  public async importLedgerTransactions(header: LedgerHeader, transactions: Transaction[]) {
    const c = new Cache(this.connection, new LedgerBuilder(header).build());
    console.log(await c.populate());
    // await this.ledger(header);
    //
    // for (const transaction of transactions) {
    //   await this.transaction(transaction);
    //
    //   for (let index = 0; index < transaction.operationsXDR().length; index++) {
    //     await this.operation(transaction, index);
    //   }
    // }
  }
}
