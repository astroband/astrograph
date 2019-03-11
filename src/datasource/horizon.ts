import { RESTDataSource } from "apollo-datasource-rest";
import { AccountID } from "../model";
import { HorizonOperationData, IHorizonTransactionData } from "./types";

export default class HorizonAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://horizon.stellar.org/";
  }

  public async getAccountOperations(
    accountId: AccountID,
    first = 10,
    order = "desc",
    cursor?: string
  ): Promise<HorizonOperationData[]> {
    const params: { limit: number; order: string; cursor?: string } = { limit: first, order };

    if (cursor) {
      params.cursor = cursor;
    }

    const data = await this.get(`accounts/${accountId}/operations`, params);

    data._embedded.records.forEach((record: any) => {
      delete record._links;
    });

    return data._embedded.records;
  }

  public async getTransactions(transactionIds: string[]): Promise<IHorizonTransactionData[]> {
    const promises = transactionIds.map(id => this.get(`transactions/${id}`));

    return Promise.all(promises).then(responses => {
      responses.forEach((record: IHorizonTransactionData & { _links: object }) => {
        delete record._links;
      });
      return responses;
    });
  }
}
