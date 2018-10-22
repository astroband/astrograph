import { Asset } from "stellar-sdk";
import { LedgerHeader, Transaction } from "../model";
import { Connection } from "./connection";

import * as q from "./queries";

export class Repo {
  protected connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public account(id: string): Promise<q.IAccountQueryResult> {
    return new q.AccountQuery(this.connection, id).call();
  }

  public asset(asset: Asset): Promise<q.IAssetQueryResult> {
    return new q.AssetQuery(this.connection, asset).call();
  }

  public ledger(ledger: LedgerHeader): Promise<q.ILedgerQueryResult> {
    return new q.LedgerQuery(this.connection, ledger).call();
  }

  public transaction(transaction: Transaction): Promise<q.ITransactionQueryResult> {
    return new q.TransactionQuery(this.connection, transaction).call();
  }

  public operation(transaction: Transaction, index: number): Promise<q.IOperationQueryResult> {
    return new q.OperationQuery(this.connection, transaction, index).call();
  }
}
