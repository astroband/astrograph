import { AccountID } from "../../model";
import { PagingParams, parseCursorPagination, properlyOrdered } from "../../util/paging";
import { IHorizonOperationData } from "../types";
import { BaseHorizonDataSource } from "./base";

export class HorizonPaymentsDataSource extends BaseHorizonDataSource {
  public async all(pagingParams: PagingParams): Promise<IHorizonOperationData[]> {
    const records = await this.request("payments", { ...parseCursorPagination(pagingParams), cacheTtl: 5 });

    return properlyOrdered(records, pagingParams);
  }

  public async forAccount(accountId: AccountID, pagingParams: PagingParams): Promise<IHorizonOperationData[]> {
    const records = await this.request(`accounts/${accountId}/payments`, {
      ...parseCursorPagination(pagingParams),
      cacheTtl: 5
    });

    return properlyOrdered(records, pagingParams);
  }

  public async forLedger(ledgerSeq: number, pagingParams: PagingParams): Promise<IHorizonOperationData[]> {
    const records = await this.request(`ledgers/${ledgerSeq}/payments`, {
      ...parseCursorPagination(pagingParams),
      cacheTtl: 5
    });

    return properlyOrdered(records, pagingParams);
  }

  public async forTransaction(transactionId: string, pagingParams: PagingParams): Promise<IHorizonOperationData[]> {
    const records = await this.request(`transactions/${transactionId}/payments`, {
      ...parseCursorPagination(pagingParams),
      cacheTtl: 5
    });

    return properlyOrdered(records, pagingParams);
  }
}
