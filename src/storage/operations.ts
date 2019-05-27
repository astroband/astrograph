import { AccountID } from "../model/account_id";
import { PagingParams, properlyOrdered } from "../util/paging";
import { BaseStorage } from "./base";

export class OperationsStorage extends BaseStorage {
  public async all(pagingParams: PagingParams) {
    const searchParams = this.buildSearchParams(pagingParams);
    const docs = await this.search(searchParams);

    return properlyOrdered(docs, pagingParams);
  }

  public async forAccount(accountId: AccountID, pagingParams: PagingParams) {
    const searchParams = this.buildSearchParams(pagingParams);
    searchParams.query.bool.must.push({ term: { source_account_id: accountId } });

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
