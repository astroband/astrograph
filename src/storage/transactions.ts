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

  public async findById(id: string) {
    return this.addTerm({ id }).one();
  }

  protected get elasticIndexName() {
    return "tx";
  }

  protected hitID(hit: any): string {
    return hit._source.id;
  }

  protected convertRawDoc(doc: any): Transaction {
    return TransactionWithXDRFactory.fromStorage(doc);
  }
}
