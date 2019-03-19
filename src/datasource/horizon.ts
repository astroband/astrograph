import { RESTDataSource } from "apollo-datasource-rest";
import { AccountID } from "../model/account_id";
import { IHorizonOperationData, IHorizonTransactionData } from "./types";

export type OperationsParent = "transaction" | "account" | "ledger";

export default class HorizonAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://horizon.stellar.org/";
  }

  public async getOperations(
    parent: OperationsParent,
    entityId: string,
    first = 10,
    order = "desc",
    cursor?: string
  ): Promise<IHorizonOperationData[]> {
    const params: { limit: number; order: string; cursor?: string } = { limit: first, order };

    if (cursor) {
      params.cursor = cursor;
    }

    const data = await this.get(`${parent}s/${entityId}/operations`, params);

    data._embedded.records.forEach((record: any) => {
      delete record._links;
    });

    return data._embedded.records;
  }

  public async getTransactionsByIds(transactionIds: string[]): Promise<IHorizonTransactionData[]> {
    const promises = transactionIds.map(id => this.request(`transactions/${id}`));

    return Promise.all(promises);
  }

  public async getTransactions(
    limit: number,
    order: "asc" | "desc" = "desc",
    cursor?: string
  ): Promise<IHorizonTransactionData[]> {
    return this.request("transactions", limit, order, cursor);
  }

  public async getAccountTransactions(
    accountId: AccountID,
    limit: number,
    order: "asc" | "desc" = "desc",
    cursor?: string
  ): Promise<IHorizonTransactionData[]> {
    return this.request(`accounts/${accountId}/transactions`, limit, order, cursor);
  }

  public async getLedgerTransactions(
    ledgerSeq: number,
    limit: number,
    order: "asc" | "desc" = "desc",
    cursor?: string
  ): Promise<IHorizonTransactionData[]> {
    return this.request(`ledgers/${ledgerSeq}/transactions`, limit, order, cursor);
  }

  private async request(url: string, limit?: number, order?: "asc" | "desc", cursor?: string) {
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
