import { AccountID, OperationType } from "../model";
import { DataMapper } from "../model/factories/operation_data_mapper/storage";
import { BaseStorage } from "./base";

export class OperationsStorage extends BaseStorage {
  public filterTypes(types: OperationType[]) {
    const storageTypes = types.map(type => DataMapper.mapOperationType(type));
    this.searchParams.query.bool.must.push({ terms: { type: storageTypes } });

    return this;
  }

  public forAccount(accountId: AccountID) {
    this.addTerm({ source_account_id: accountId });

    return this;
  }

  public forTransaction(txId: string) {
    this.addTerm({ tx_id: txId });

    return this;
  }

  public forLedger(seq: number) {
    this.addTerm({ seq });

    return this;
  }

  protected get elasticIndexName() {
    return "op";
  }
}
