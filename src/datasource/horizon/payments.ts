import { AccountID } from "../../model";
import { IHorizonOperationData } from "../types";
import { BaseHorizonDataSource, PagingParams } from "./base";

export class HorizonPaymentsDataSource extends BaseHorizonDataSource {
  public async all(pagingParams: PagingParams): Promise<IHorizonOperationData[]> {
    const records = await this.request("payments", { ...this.parseCursorPagination(pagingParams), cacheTtl: 5 });

    return this.properlyOrdered(records, pagingParams);
  }

  public async forAccount(accountId: AccountID, pagingParams: PagingParams): Promise<IHorizonOperationData[]> {
    const records = await this.request(`accounts/${accountId}/payments`, {
      ...this.parseCursorPagination(pagingParams),
      cacheTtl: 5
    });

    return this.properlyOrdered(records, pagingParams);
  }

  public async forLedger(ledgerSeq: number, pagingParams: PagingParams): Promise<IHorizonOperationData[]> {
    const records = await this.request(`ledgers/${ledgerSeq}/payments`, {
      ...this.parseCursorPagination(pagingParams),
      cacheTtl: 5
    });

    return this.properlyOrdered(records, pagingParams);
  }

  public async forTransaction(
    transactionId: string,
    pagingParams: PagingParams
  ): Promise<IHorizonOperationData[]> {
    const records = await this.request(`transactions/${transactionId}/payments`, {
      ...this.parseCursorPagination(pagingParams),
      cacheTtl: 5
    });

    return this.properlyOrdered(records, pagingParams);
  }
}
