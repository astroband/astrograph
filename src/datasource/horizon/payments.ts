import { AccountID, IAssetInput } from "../../model";
import { AssetFactory } from "../../model/factories";
import { IHorizonOperationData, IHorizonPaymentPathData } from "../types";
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

  public async forTransaction(transactionId: string, pagingParams: PagingParams): Promise<IHorizonOperationData[]> {
    const records = await this.request(`transactions/${transactionId}/payments`, {
      ...this.parseCursorPagination(pagingParams),
      cacheTtl: 5
    });

    return this.properlyOrdered(records, pagingParams);
  }

  public async findPaths(
    sourceAccountID: AccountID,
    destinationAccountID: AccountID,
    destinationAmount: string,
    destinationAssetInput: IAssetInput
  ): Promise<IHorizonPaymentPathData> {
    const destinationAsset = AssetFactory.fromInput(destinationAssetInput);

    return this.request("paths", {
      source_account: sourceAccountID,
      destination_account: destinationAccountID,
      destination_asset_type: destinationAsset.getAssetType(),
      destination_asset_code: destinationAsset.getCode(),
      destination_asset_issuer: destinationAsset.getIssuer(),
      destination_amount: destinationAmount,
      cacheTtl: 120
    });
  }
}
