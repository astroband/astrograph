import { AccountID } from "../../model";
import { PagingParams, parseCursorPagination, properlyOrdered } from "../../util/paging";
import { IHorizonOperationData } from "../types";
import { BaseHorizonDataSource } from "./base";

export class HorizonOperationsDataSource extends BaseHorizonDataSource {
  public async byId(operationId: string): Promise<IHorizonOperationData> {
    return this.request(`operations/${operationId}`);
  }

  public async all(pagingParams: PagingParams): Promise<IHorizonOperationData[]> {
    return properlyOrdered(await this.request("operations", parseCursorPagination(pagingParams)), pagingParams);
  }

  public async forAccount(accountId: AccountID, pagingParams: PagingParams) {
    return properlyOrdered(
      await this.request(`accounts/${accountId}/operations`, parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async forLedger(ledgerSeq: number, pagingParams: PagingParams) {
    return properlyOrdered(
      await this.request(`ledgers/${ledgerSeq}/operations`, parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async forTransaction(transactionId: string, pagingParams: PagingParams) {
    return properlyOrdered(
      await this.request(`transactions/${transactionId}/operations`, parseCursorPagination(pagingParams)),
      pagingParams
    );
  }
}
