import { AccountID, Transaction } from "../model";
import { TransactionWithXDRFactory } from "../model/factories";
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

  protected convertRawDoc(doc: any): Transaction {
    return TransactionWithXDRFactory.fromStorage(doc);
  }
}
