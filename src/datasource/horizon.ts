import { RESTDataSource } from "apollo-datasource-rest";
import { IHorizonOperationData } from "./types";

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
}
