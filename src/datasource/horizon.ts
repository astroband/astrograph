import { RESTDataSource } from "apollo-datasource-rest";
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
