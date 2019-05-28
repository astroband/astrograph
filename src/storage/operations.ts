import { AccountID, OperationType } from "../model";
import { DataMapper } from "../model/factories/operation_data_mapper/storage";
import { PagingParams, properlyOrdered } from "../util/paging";
import { BaseStorage } from "./base";

export class OperationsStorage extends BaseStorage {
  public async all(pagingParams: PagingParams) {
    const searchParams = this.buildSearchParams(pagingParams);
    const docs = await this.search(searchParams);

    return properlyOrdered(docs, pagingParams);
  }

  public async find(types: OperationType[], pagingParams: PagingParams) {
    const storageTypes = types.map(type => DataMapper.mapOperationType(type));
    const searchParams = this.buildSearchParams(pagingParams);
    searchParams.query.bool.must.push({ terms: { type: storageTypes } });
    const docs = await this.search(searchParams);

    return properlyOrdered(docs, pagingParams);
  }

  public async forAccount(accountId: AccountID, pagingParams: PagingParams) {
    const searchParams = this.buildSearchParams(pagingParams);
    searchParams.query.bool.must.push({ term: { source_account_id: accountId } });

    const docs = await this.search(searchParams);

    return properlyOrdered(docs, pagingParams);
  }

  public async forLedger(seq: number, pagingParams: PagingParams) {
    const searchParams = this.buildSearchParams(pagingParams);
    searchParams.query.bool.must.push({ term: { seq } });

    const docs = await this.search(searchParams);

    return properlyOrdered(docs, pagingParams);
  }

  public async forTransaction(txId: string, pagingParams: PagingParams) {
    const searchParams = this.buildSearchParams(pagingParams);
    searchParams.query.bool.must.push({ term: { tx_id: txId } });

    const docs = await this.search(searchParams);

    return properlyOrdered(docs, pagingParams);
  }

  public async byId(id: string) {
    return this.get(id);
  }

  protected get elasticIndexName() {
    return "op";
  }
}
