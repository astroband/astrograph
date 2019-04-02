import { RESTDataSource } from "apollo-datasource-rest";
import { AccountID, IAssetInput } from "../model";

import {
  HorizonAssetType,
  IHorizonAssetData,
  IHorizonOperationData,
  IHorizonOrderBookData,
  IHorizonPaymentPathData,
  IHorizonTradeAggregationData,
  IHorizonTransactionData
} from "./types";

type SortOrder = "desc" | "asc";

export default class HorizonAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://horizon.stellar.org/";
  }

  public async getOperations(limit = 10, order: SortOrder = "desc", cursor?: string): Promise<IHorizonOperationData[]> {
    return this.request("operations", { pagingOptions: { limit, order, cursor } });
  }

  public async getAccountOperations(accountId: AccountID, limit = 10, order: SortOrder = "desc", cursor?: string) {
    return this.request(`accounts/${accountId}/operations`, { pagingOptions: { limit, order, cursor } });
  }

  public async getLedgerOperations(ledgerSeq: number, limit = 10, order: SortOrder = "desc", cursor?: string) {
    return this.request(`ledgers/${ledgerSeq}/operations`, { pagingOptions: { limit, order, cursor } });
  }

  public async getTransactionOperations(transactionId: string, limit = 10, order: SortOrder = "desc", cursor?: string) {
    return this.request(`transactions/${transactionId}/operations`, { pagingOptions: { limit, order, cursor } });
  }

  public async getTransactionsByIds(transactionIds: string[]): Promise<IHorizonTransactionData[]> {
    const promises = transactionIds.map(id => this.request(`transactions/${id}`));

    return Promise.all(promises);
  }

  public async getTransactions(
    limit: number,
    order: SortOrder = "desc",
    cursor?: string
  ): Promise<IHorizonTransactionData[]> {
    return this.request("transactions", { pagingOptions: { limit, order, cursor } });
  }

  public async getAccountTransactions(
    accountId: AccountID,
    limit: number,
    order: SortOrder = "desc",
    cursor?: string
  ): Promise<IHorizonTransactionData[]> {
    return this.request(`accounts/${accountId}/transactions`, { pagingOptions: { limit, order, cursor } });
  }

  public async getLedgerTransactions(
    ledgerSeq: number,
    limit: number,
    order: SortOrder = "desc",
    cursor?: string
  ): Promise<IHorizonTransactionData[]> {
    return this.request(`ledgers/${ledgerSeq}/transactions`, { pagingOptions: { limit, order, cursor } });
  }

  public async getAssets(
    criteria: IAssetInput,
    limit: number,
    order: SortOrder = "asc",
    cursor?: string
  ): Promise<IHorizonAssetData[]> {
    return this.request(`assets`, {
      asset_code: criteria.code,
      asset_issuer: criteria.issuer,
      limit,
      order,
      cursor,
      cacheTtl: 600
    });
  }

  public async getOrderBook(selling: IAssetInput, buying: IAssetInput, limit?: number): Promise<IHorizonOrderBookData> {
    return this.request("order_book", {
      selling_asset_type: this.predictAssetType(selling.code),
      selling_asset_code: selling.code,
      selling_asset_issuer: selling.issuer,
      buying_asset_type: this.predictAssetType(buying.code),
      buying_asset_code: buying.code,
      buying_asset_issuer: buying.issuer,
      limit,
      cacheTtl: 15
    });
  }

  public async getPaymentPath(
    sourceAccountID: AccountID,
    destinationAccountID: AccountID,
    destinationAmount: string,
    destinationAsset: IAssetInput
  ): Promise<IHorizonPaymentPathData> {
    return this.request("paths", {
      source_account: sourceAccountID,
      destination_account: destinationAccountID,
      destination_asset_type: this.predictAssetType(destinationAsset.code),
      destination_asset_code: destinationAsset.code,
      destination_asset_issuer: destinationAsset.issuer,
      destination_amount: destinationAmount,
      cacheTtl: 120
    });
  }

  public async getTradeAggregations(
    baseAsset: IAssetInput,
    counterAsset: IAssetInput,
    startTime: number,
    endTime: number,
    resolution: number,
    limit: number,
    order: "asc" | "desc" | undefined
  ): Promise<IHorizonTradeAggregationData> {
    return this.request("trade_aggregations", {
      base_asset_type: this.predictAssetType(baseAsset.code),
      base_asset_code: baseAsset.code,
      base_asset_issuer: baseAsset.issuer,
      counter_asset_type: this.predictAssetType(counterAsset.code),
      counter_asset_code: counterAsset.code,
      counter_asset_issuer: counterAsset.issuer,
      start_time: startTime,
      end_time: endTime,
      resolution,
      limit,
      order,
      cacheTtl: 60 * 5
    });
  }

  private async request(
    url: string,
    params: {
      [key: string]: any;
      limit?: number;
      order?: SortOrder;
      cursor?: string;
      cacheTtl?: number;
    } = {}
  ) {
    let cacheTtl = 7 * 24 * 60 * 60; // cache for a week by default

    if (params.cacheTtl) {
      cacheTtl = params.cacheTtl;
      delete params.cacheTtl;
    }

    Object.keys(params).forEach(key => {
      if (!params[key]) {
        delete params[key];
      }
    });

    const response = await this.get(url, params, { cacheOptions: { ttl: cacheTtl } });

    if (response._embedded) {
      response._embedded.records.forEach((record: any) => {
        delete record._links;
      });

      return response._embedded.records;
    }

    delete response._links;

    return response;
  }

  private predictAssetType(code: string | undefined): HorizonAssetType {
    if (code === undefined) {
      return "native";
    }
    if (code === "native") {
      return "native";
    }
    return code.length > 4 ? "credit_alphanum12" : "credit_alphanum4";
  }
}
