import { Connection } from "./connection";
import { LedgerHeader, Transaction } from "../model";

export class Store {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public ledger(header: LedgerHeader) {

  }

  public transaction(transaction: Transaction) {

  }
}
