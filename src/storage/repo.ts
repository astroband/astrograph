import { LedgerHeader } from "../model";
import { Connection } from "./connection";

import * as q from "./queries";

export class Repo {
  protected connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public ledger(ledger: LedgerHeader): Promise<q.ILedgerQueryResult> {
    return new q.LedgerQuery(this.connection, ledger).call();
  }
}
