import { RESTDataSource } from "apollo-datasource-rest";
import { SortOrder } from "../../util/paging";

interface IForwardPagingParams {
  first: number;
  after: string;
}

interface IBackwardPagingParams {
  last: number;
  before: string;
}

export type PagingParams = IForwardPagingParams & IBackwardPagingParams;

export abstract class BaseHorizonDataSource extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://horizon.stellar.org/";
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

  protected parseCursorPagination(args: PagingParams) {
    return {
      limit: args.first || args.last,
      order: (args.last ? "asc" : "desc") as SortOrder,
      cursor: args.last ? args.before : args.after
    };
  }

  protected properlyOrdered(records: any[], pagingParams: PagingParams): any[] {
    if (pagingParams.last && pagingParams.before) {
      return records.reverse();
    }

    return records;
  }
}
