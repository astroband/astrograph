import { AccountID } from "../../model";
import { IHorizonEffectData } from "../types";
import { BaseHorizonDataSource, PagingParams } from "./base";

export class HorizonEffectsDataSource extends BaseHorizonDataSource {
  public async all(pagingParams: PagingParams): Promise<IHorizonEffectData[]> {
    return this.properlyOrdered(
      await this.request("effects", { ...this.parseCursorPagination(pagingParams), cacheTtl: 10 }),
      pagingParams
    );
  }

  public async forTransaction(transactionId: string, pagingParams: PagingParams): Promise<IHorizonEffectData[]> {
    return this.properlyOrdered(
      await this.request(`transactions/${transactionId}/effects`, {
        ...this.parseCursorPagination(pagingParams),
        cacheTtl: 10
      }),
      pagingParams
    );
  }

  public async forAccount(accountId: AccountID, pagingParams: PagingParams): Promise<IHorizonEffectData[]> {
    return this.properlyOrdered(
      await this.request(`accounts/${accountId}/effects`, {
        ...this.parseCursorPagination(pagingParams),
        cacheTtl: 10
      }),
      pagingParams
    );
  }

  public async forLedger(ledgerSeq: number, pagingParams: PagingParams): Promise<IHorizonEffectData[]> {
    return this.properlyOrdered(
      await this.request(`ledgers/${ledgerSeq}/effects`, {
        ...this.parseCursorPagination(pagingParams),
        cacheTtl: 10
      }),
      pagingParams
    );
  }
}
