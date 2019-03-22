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
    return this.request("operations", limit, order, cursor);
  }

  public async getAccountOperations(accountId: AccountID, limit = 10, order: SortOrder = "desc", cursor?: string) {
    return this.request(`accounts/${accountId}/operations`, limit, order, cursor);
  }

  public async getLedgerOperations(ledgerSeq: number, limit = 10, order: SortOrder = "desc", cursor?: string) {
    return this.request(`ledgers/${ledgerSeq}/operations`, limit, order, cursor);
  }

  public async getTransactionOperations(transactionId: string, limit = 10, order: SortOrder = "desc", cursor?: string) {
    return this.request(`transactions/${transactionId}/operations`, limit, order, cursor);
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
    return this.request("transactions", limit, order, cursor);
  }

  public async getAccountTransactions(
    accountId: AccountID,
    limit: number,
    order: SortOrder = "desc",
    cursor?: string
  ): Promise<IHorizonTransactionData[]> {
    return this.request(`accounts/${accountId}/transactions`, limit, order, cursor);
  }

  public async getLedgerTransactions(
    ledgerSeq: number,
    limit: number,
    order: SortOrder = "desc",
    cursor?: string
  ): Promise<IHorizonTransactionData[]> {
    return this.request(`ledgers/${ledgerSeq}/transactions`, limit, order, cursor);
  }

  private async request(url: string, limit?: number, order?: SortOrder, cursor?: string) {
    const params = { limit, order, cursor };

    Object.keys(params).forEach(key => {
      if (!params[key]) {
        delete params[key];
      }
    });

    const response = await this.get(url, params);

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
