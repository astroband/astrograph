import { AccountID, OperationType } from "../model";
import { DataMapper } from "../model/factories/operation_data_mapper/storage";
import { PagingParams, parseCursorPagination, properlyOrdered } from "../util/paging";
import { BaseStorage } from "./base";

export class OperationsStorage extends BaseStorage {
  private searchParams: any;

  constructor() {
    super();

    this.searchParams = {
      query: {
        bool: {
          must: []
        }
      }
    };
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

  public async all(pagingParams: PagingParams) {
    this.paginate(pagingParams);

    const docs = await this.search(this.searchParams);

    return properlyOrdered(docs, pagingParams);
  }

  protected get elasticIndexName() {
    return "op";
  }

  private addTerm(term: any) {
    this.searchParams.query.bool.must.push({ term });
  }

  private paginate(pagingParams: PagingParams) {
    const { limit, order, cursor } = parseCursorPagination(pagingParams);
    this.searchParams.sort = [{ order }];
    this.searchParams.size = limit;

    if (cursor) {
      this.searchParams.query.bool.must.push({
        range: { order: pagingParams.after ? { gt: cursor } : { lt: cursor } }
      });
    }
  }
}
