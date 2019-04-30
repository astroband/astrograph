import { AccountID } from "../../model";
import { PagingParams, parseCursorPagination, properlyOrdered } from "../../util/paging";
import { IHorizonEffectData } from "../types";
import { BaseHorizonDataSource } from "./base";

export class HorizonEffectsDataSource extends BaseHorizonDataSource {
  public async all(pagingParams: PagingParams): Promise<IHorizonEffectData[]> {
    return properlyOrdered(
      await this.request("effects", { ...parseCursorPagination(pagingParams), cacheTtl: 10 }),
      pagingParams
    );
  }

  public async forTransaction(transactionId: string, pagingParams: PagingParams): Promise<IHorizonEffectData[]> {
    return properlyOrdered(
      await this.request(`transactions/${transactionId}/effects`, {
        ...parseCursorPagination(pagingParams),
        cacheTtl: 10
      }),
      pagingParams
    );
  }

  public async forAccount(accountId: AccountID, pagingParams: PagingParams): Promise<IHorizonEffectData[]> {
    return properlyOrdered(
      await this.request(`accounts/${accountId}/effects`, {
        ...parseCursorPagination(pagingParams),
        cacheTtl: 10
      }),
      pagingParams
    );
  }

  public async forLedger(ledgerSeq: number, pagingParams: PagingParams): Promise<IHorizonEffectData[]> {
    return properlyOrdered(
      await this.request(`ledgers/${ledgerSeq}/effects`, {
        ...parseCursorPagination(pagingParams),
        cacheTtl: 10
      }),
      pagingParams
    );
  }
}
