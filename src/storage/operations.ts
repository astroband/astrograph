import { AccountID } from "../model/account_id";
import { PagingParams, parseCursorPagination, properlyOrdered } from "../util/paging";
import { BaseStorage } from "./base";

export class OperationsStorage extends BaseStorage {
  public async all(pagingParams: PagingParams) {
    const { limit, order, cursor } = parseCursorPagination(pagingParams);
    const range = pagingParams.last ? { gt: cursor } : { lt: cursor };

    const docs = await this.search({
      sort: [{ order }],
      size: limit,
      query: { range: { order: range } }
    });

    return properlyOrdered(docs, pagingParams);
  }

  public async forAccount(accountId: AccountID, pagingParams: PagingParams) {
    const { limit, order, cursor } = parseCursorPagination(pagingParams);
    const range = pagingParams.last ? { gt: cursor } : { lt: cursor };

    const docs = await this.search({
      sort: [{ order }],
      size: limit,
      query: {
        bool: {
          must: [{ term: { source_account_id: accountId } }, { range: { order: range } }]
        }
      }
    });

    return properlyOrdered(docs, pagingParams);
  }

  public async byId(id: string) {
    return this.get(id);
  }

  protected get elasticIndexName() {
    return "op";
  }
}
