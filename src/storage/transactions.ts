import { AccountID } from "../model";
import { BaseStorage } from "./base";

export class TransactionsStorage extends BaseStorage {
  public forAccount(accountId: AccountID) {
    this.addTerm({ source_account_id: accountId });

    return this;
  }

  public forLedger(seq: number) {
    this.addTerm({ seq });

    return this;
  }

  protected get elasticIndexName() {
    return "tx";
  }
}
