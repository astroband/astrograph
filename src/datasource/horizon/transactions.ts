import { AccountID } from "../../model";
import { IHorizonTransactionData } from "../types";
import { BaseHorizonDataSource, PagingParams } from "./base";

export class HorizonTransactionsDataSource extends BaseHorizonDataSource {
  public async byIds(transactionIds: string[]): Promise<IHorizonTransactionData[]> {
    const promises = transactionIds.map(id => this.request(`transactions/${id}`));

    return Promise.all(promises);
  }

  public async all(pagingParams: PagingParams): Promise<IHorizonTransactionData[]> {
    return this.properlyOrdered(
      await this.request("transactions", this.parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async forAccount(accountId: AccountID, pagingParams: PagingParams): Promise<IHorizonTransactionData[]> {
    return this.properlyOrdered(
      await this.request(`accounts/${accountId}/transactions`, this.parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async forLedger(seq: number, pagingParams: PagingParams): Promise<IHorizonTransactionData[]> {
    return this.properlyOrdered(
      await this.request(`ledgers/${seq}/transactions`, this.parseCursorPagination(pagingParams)),
      pagingParams
    );
  }
}
