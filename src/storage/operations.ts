import { AccountID, Operation, OperationType } from "../model";
import { OperationFactory } from "../model/factories";
import { DataMapper } from "../model/factories/operation_data_mapper/storage";
import { PagingParams } from "../util/paging";
import { BaseStorage } from "./base";
import { OperationData as StorageOperationData } from "./types";

export class OperationsStorage extends BaseStorage {
  public static async forTransaction(txId: string, paging?: PagingParams): Promise<StorageOperationData[]> {
    return new OperationsStorage().addTerm({ tx_id: txId }).all(paging);
  }

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

  protected convertRawDoc(doc: any): Operation {
    return OperationFactory.fromStorage(doc);
  }
}
