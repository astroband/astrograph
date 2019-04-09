import { RESTDataSource } from "apollo-datasource-rest";
import { AccountID, IAssetInput } from "../model";
import { SortOrder } from "../util/paging";
import {
  HorizonAssetType,
  IHorizonAssetData,
  IHorizonEffectData,
  IHorizonOperationData,
  IHorizonOrderBookData,
  IHorizonPaymentPathData,
  IHorizonTradeAggregationData,
  IHorizonTradeData,
  IHorizonTransactionData
} from "./types";

interface IForwardPagingParams {
  first: number;
  after: string;
}

interface IBackwardPagingParams {
  last: number;
  before: string;
}

type PagingParams = IForwardPagingParams & IBackwardPagingParams;

export default class HorizonAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://horizon.stellar.org/";
  }

  public async getPayments(pagingParams: PagingParams): Promise<IHorizonOperationData[]> {
    const records = await this.request("payments", { ...this.parseCursorPagination(pagingParams), cacheTtl: 5 });

    return this.properlyOrdered(records, pagingParams);
  }

  public async getAccountPayments(accountId: AccountID, pagingParams: PagingParams): Promise<IHorizonOperationData[]> {
    const records = await this.request(`accounts/${accountId}/payments`, {
      ...this.parseCursorPagination(pagingParams),
      cacheTtl: 5
    });

    return this.properlyOrdered(records, pagingParams);
  }

  public async getLedgerPayments(ledgerSeq: number, pagingParams: PagingParams): Promise<IHorizonOperationData[]> {
    const records = await this.request(`ledgers/${ledgerSeq}/payments`, {
      ...this.parseCursorPagination(pagingParams),
      cacheTtl: 5
    });

    return this.properlyOrdered(records, pagingParams);
  }

  public async getTransactionPayments(
    transactionId: string,
    pagingParams: PagingParams
  ): Promise<IHorizonOperationData[]> {
    const records = await this.request(`transactions/${transactionId}/payments`, {
      ...this.parseCursorPagination(pagingParams),
      cacheTtl: 5
    });

    return this.properlyOrdered(records, pagingParams);
  }

  public async getOperations(pagingParams: PagingParams): Promise<IHorizonOperationData[]> {
    return this.properlyOrdered(
      await this.request("operations", this.parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async getAccountOperations(accountId: AccountID, pagingParams: PagingParams) {
    return this.properlyOrdered(
      await this.request(`accounts/${accountId}/operations`, this.parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async getLedgerOperations(ledgerSeq: number, pagingParams: PagingParams) {
    return this.properlyOrdered(
      await this.request(`ledgers/${ledgerSeq}/operations`, this.parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async getTransactionOperations(transactionId: string, pagingParams: PagingParams) {
    return this.properlyOrdered(
      await this.request(`transactions/${transactionId}/operations`, this.parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async getTransactionsByIds(transactionIds: string[]): Promise<IHorizonTransactionData[]> {
    const promises = transactionIds.map(id => this.request(`transactions/${id}`));

    return Promise.all(promises);
  }

  public async getOperationById(operationId: string): Promise<IHorizonOperationData> {
    return this.request(`operations/${operationId}`);
  }

  public async getTransactions(pagingParams: PagingParams): Promise<IHorizonTransactionData[]> {
    return this.properlyOrdered(
      await this.request("transactions", this.parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async getAccountTransactions(
    accountId: AccountID,
    pagingParams: PagingParams
  ): Promise<IHorizonTransactionData[]> {
    return this.properlyOrdered(
      await this.request(`accounts/${accountId}/transactions`, this.parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async getLedgerTransactions(seq: number, pagingParams: PagingParams): Promise<IHorizonTransactionData[]> {
    return this.properlyOrdered(
      await this.request(`ledgers/${seq}/transactions`, this.parseCursorPagination(pagingParams)),
      pagingParams
    );
  }

  public async getAssets(criteria: IAssetInput, pagingParams: PagingParams): Promise<IHorizonAssetData[]> {
    const records = await this.request("assets", {
      ...this.parseCursorPagination(pagingParams),
      asset_code: criteria.code,
      asset_issuer: criteria.issuer,
      cacheTtl: 600
    });

    return this.properlyOrdered(records, pagingParams);
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
    pagingParams: PagingParams
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
      ...this.parseCursorPagination(pagingParams),
      cacheTtl: 60 * 5
    });
  }

  public async getTrades(
    pagingParams: PagingParams,
    baseAsset?: IAssetInput,
    counterAsset?: IAssetInput,
    offerID?: number
  ): Promise<IHorizonTradeData> {
    const params: any = {
      offer_id: offerID,
      ...this.parseCursorPagination(pagingParams),
      cacheTtl: 60 * 15
    };

    if (baseAsset) {
      params.base_asset_type = this.predictAssetType(baseAsset.code);
      params.base_asset_code = baseAsset.code;
      params.base_asset_issuer = baseAsset.issuer;
    }

    if (counterAsset) {
      params.counter_asset_type = this.predictAssetType(counterAsset.code);
      params.counter_asset_code = counterAsset.code;
      params.counter_asset_issuer = counterAsset.issuer;
    }

    return this.request("trades", params);
  }

  public async getAccountTrades(accountID: AccountID, pagingParams: PagingParams): Promise<IHorizonTradeData[]> {
    return this.properlyOrdered(
      await this.request(`/accounts/${accountID}/trades`, {
        ...this.parseCursorPagination(pagingParams),
        cacheTtl: 60 * 15
      }),
      pagingParams
    );
  }

  public async getOfferTrades(
    offerID: string,
    limit?: number,
    order: SortOrder = SortOrder.ASC,
    cursor?: string
  ): Promise<IHorizonTradeData> {
    return this.request(`/offers/${offerID}/trades`, {
      limit,
      order,
      cursor,
      cacheTtl: 60 * 15
    });
  }

  public async getEffects(pagingParams: PagingParams): Promise<IHorizonEffectData[]> {
    return this.properlyOrdered(
      await this.request("effects", { ...this.parseCursorPagination(pagingParams), cacheTtl: 10 }),
      pagingParams
    );
  }

  public async getTransactionEffects(transactionId: string, pagingParams: PagingParams): Promise<IHorizonEffectData[]> {
    return this.properlyOrdered(
      await this.request(`transactions/${transactionId}/effects`, {
        ...this.parseCursorPagination(pagingParams),
        cacheTtl: 10
      }),
      pagingParams
    );
  }

  public async getAccountEffects(accountId: AccountID, pagingParams: PagingParams): Promise<IHorizonEffectData[]> {
    return this.properlyOrdered(
      await this.request(`accounts/${accountId}/effects`, {
        ...this.parseCursorPagination(pagingParams),
        cacheTtl: 10
      }),
      pagingParams
    );
  }

  public async getLedgerEffects(
    ledgerSeq: number,
    limit = 10,
    order: SortOrder = SortOrder.DESC,
    cursor?: string
  ): Promise<IHorizonEffectData[]> {
    return this.request(`ledgers/${ledgerSeq}/effects`, { limit, order, cursor, cacheTtl: 10 });
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

  private parseCursorPagination(args: PagingParams) {
    return {
      limit: args.first || args.last,
      order: (args.last ? "asc" : "desc") as SortOrder,
      cursor: args.last ? args.before : args.after
    };
  }

  private properlyOrdered(records: any[], pagingParams: PagingParams): any[] {
    if (pagingParams.last && pagingParams.before) {
      return records.reverse();
    }

    return records;
  }
}
