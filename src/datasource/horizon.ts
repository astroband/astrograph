import { RESTDataSource } from "apollo-datasource-rest";
import { AccountID, IAssetInput } from "../model";
import { IHorizonAssetData, IHorizonOperationData, IHorizonTransactionData, IHorizonOrderBookData } from "./types";

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

  private predictAssetCode(code: string | undefined): string {
    if (code == undefined) { 
      return "native"
    }
    return code.length > 4 ? "credit_alphanum12" : "credit_alphanum4";
  }

  public async getOrderBook(
    selling: IAssetInput,
    buying: IAssetInput
  ): Promise<IHorizonOrderBookData> {
    const selling_type = this.predictAssetCode(selling.code)
    const buying_type = this.predictAssetCode(buying.code)

    return this.request("order_book", {
      selling_asset_type: selling_type,
      selling_asset_code: selling.code,
      selling_asset_issuer: selling.issuer,
      buying_asset_type: buying_type,
      buying_asset_code: buying.code,
      buying_asset_issuer: buying.issuer
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
}
