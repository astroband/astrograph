import { AccountID } from "../../model";
import { PagingParams, parseCursorPagination, properlyOrdered } from "../../util/paging";
import { IHorizonTransactionData } from "../types";
import { BaseHorizonDataSource } from "./base";

export class HorizonTransactionsDataSource extends BaseHorizonDataSource {
  public async byIds(transactionIds: string[]): Promise<IHorizonTransactionData[]> {
    const promises = transactionIds.map(id => this.request(`transactions/${id}`));

    return Promise.all(promises);
  }

  public async all(pagingParams: PagingParams): Promise<IHorizonTransactionData[]> {
    return properlyOrdered(await this.request("transactions", parseCursorPagination(pagingParams)), pagingParams);
  }

  public async forAccount(accountId: AccountID, pagingParams: PagingParams): Promise<IHorizonTransactionData[]> {
    return properlyOrdered(
      await this.request(`accounts/${accountId}/transactions`, parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async forLedger(seq: number, pagingParams: PagingParams): Promise<IHorizonTransactionData[]> {
    return properlyOrdered(
      await this.request(`ledgers/${seq}/transactions`, parseCursorPagination(pagingParams)),
      pagingParams
    );
  }
}
