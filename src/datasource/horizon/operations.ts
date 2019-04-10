import { AccountID } from "../../model";
import { IHorizonOperationData } from "../types";
import { BaseHorizonDataSource, PagingParams } from "./base";

export class HorizonOperationsDataSource extends BaseHorizonDataSource {
  public async byId(operationId: string): Promise<IHorizonOperationData> {
    return this.request(`operations/${operationId}`);
  }

  public async all(pagingParams: PagingParams): Promise<IHorizonOperationData[]> {
    return this.properlyOrdered(
      await this.request("operations", this.parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async forAccount(accountId: AccountID, pagingParams: PagingParams) {
    return this.properlyOrdered(
      await this.request(`accounts/${accountId}/operations`, this.parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async forLedger(ledgerSeq: number, pagingParams: PagingParams) {
    return this.properlyOrdered(
      await this.request(`ledgers/${ledgerSeq}/operations`, this.parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async forTransaction(transactionId: string, pagingParams: PagingParams) {
    return this.properlyOrdered(
      await this.request(`transactions/${transactionId}/operations`, this.parseCursorPagination(pagingParams)),
      pagingParams
    );
  }
}
