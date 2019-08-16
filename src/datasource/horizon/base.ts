import { RESTDataSource } from "apollo-datasource-rest";
import { SortOrder } from "../../util/paging";
import { HORIZON_ENDPOINT, STELLAR_NETWORK } from "../../util/secrets";

export abstract class BaseHorizonDataSource extends RESTDataSource {
  constructor() {
    super();

    if (HORIZON_ENDPOINT) {
      this.baseURL = HORIZON_ENDPOINT;
    } else if (STELLAR_NETWORK === "pubnet") {
      this.baseURL = "https://horizon.stellar.org/";
    } else if (STELLAR_NETWORK === "testnet") {
      this.baseURL = "https://horizon-testnet.stellar.org/";
    }
  }

  protected async request(
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
