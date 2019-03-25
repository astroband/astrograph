import { RESTDataSource } from "apollo-datasource-rest";
import { AccountID } from "../model/account_id";
import { IHorizonOperationData, IHorizonTransactionData } from "./types";

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

  private async request(
    url: string,
    params?: {
      pagingOptions?: { limit?: number; order?: SortOrder; cursor?: string };
      cacheTtl?: number;
    }
  ) {
    const pagingOptions = (params && params.pagingOptions) || {};
    const cacheTtl = (params && params.cacheTtl) || 7 * 24 * 60 * 60; // cache for a week by default

    Object.keys(pagingOptions).forEach(key => {
      if (!pagingOptions[key]) {
        delete pagingOptions[key];
      }
    });

    const response = await this.get(url, pagingOptions, { cacheOptions: { ttl: cacheTtl } });

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
