import { LedgerHeader } from "../model";
import { Connection } from "./connection";
import * as queries from "./queries";

export class Repo {
  constructor(connection: Connection) {
    this.connection = connection;
  }

  public ledger(ledger: LedgerHeader): Promise<queries.ILedgerQueryResult> {
    return new LedgerQueryResult(this.connection, ledger).result();
  }
}
