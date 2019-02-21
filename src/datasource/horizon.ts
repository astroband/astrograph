import { RESTDataSource } from "apollo-datasource-rest";
import _ from "lodash";
import { AccountID } from "../model/account_id";
import { HorizonOperationData } from "./types";

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

    return data._embedded.records.map((r: any) => _.omit(r, "_links"));
  }
}
