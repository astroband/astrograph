import { RESTDataSource } from "apollo-datasource-rest";
import _ from "lodash";
import { AccountID } from "../model/account_id";
import { HorizonOperationData } from "./types";

export default class HorizonAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://horizon.stellar.org/";
  }

  public async getAccountOperations(accountId: AccountID, first = 10): Promise<HorizonOperationData[]> {
    const data = await this.get(`accounts/${accountId}/operations?limit=${first}`);

    return data._embedded.records.map((r: any) => _.omit(r, "_links"));
  }
}
